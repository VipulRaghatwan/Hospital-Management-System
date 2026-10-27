import threading
import time
import grpc
import hospital_pb2
import hospital_pb2_grpc

BACKENDS = ["localhost:60201", "localhost:60202", "localhost:60203"]
NUM_REQUESTS = 9

active = [0] * len(BACKENDS)
lock = threading.Lock()

def pick_least_connections():
    """Select the backend node with the fewest active in-flight connections."""
    with lock:
        idx = active.index(min(active))
        active[idx] += 1
        print(f"[LB] Routing -> {BACKENDS[idx]} | Active connections now: {active}")
        return idx

def release(idx):
    """Release active connection count upon request completion."""
    with lock:
        active[idx] -= 1
        print(f"[LB] Released {BACKENDS[idx]} | Active connections now: {active}")

def handle_request(req_id):
    idx = pick_least_connections()
    addr = BACKENDS[idx]
    try:
        with grpc.insecure_channel(addr) as channel:
            stub = hospital_pb2_grpc.HospitalWorkerServiceStub(channel)
            reply = stub.HandleRequest(hospital_pb2.WorkRequest(request_id=req_id), timeout=10)
            print(f"[LB] Request #{req_id} -> successfully handled by {reply.handled_by}")
    except Exception as e:
        print(f"[LB] Error processing request #{req_id}: {e}")
    finally:
        release(idx)

def main():
    print(f"[LB] Hospital Load Balancer active. Registered Backends: {BACKENDS}")
    threads = []
    for req_id in range(1, NUM_REQUESTS + 1):
        t = threading.Thread(target=handle_request, args=(req_id,))
        threads.append(t)
        t.start()
        time.sleep(0.15)  # Simulate staggered patient traffic

    for t in threads:
        t.join()

    print("\n[LB] All appointment requests processed.")
    print(f"[LB] Final active connection counts (must be all 0): {active}")

if __name__ == '__main__':
    main()