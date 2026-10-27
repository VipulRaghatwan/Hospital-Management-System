import os
import time
import threading
import grpc
import hospital_pb2
import hospital_pb2_grpc

TARGET_ADDR = os.environ.get("TARGET_ADDR", "raft-node-a:60401")

def send_request(req_id):
    try:
        with grpc.insecure_channel(TARGET_ADDR) as channel:
            stub = hospital_pb2_grpc.LockServiceStub(channel)
            # Pass req_id directly as an int for holder_id
            reply = stub.AcquireLock(hospital_pb2.LockRequest(
                resource_id=f"icu-bed-{req_id}", 
                holder_id=req_id, 
                timestamp=int(time.time())
            ), timeout=5)
            print(f"[Job Req #{req_id}] {reply.message}", flush=True)
    except Exception as e:
        print(f"[Job Req #{req_id}] Failed: {e}", flush=True)

if __name__ == "__main__":
    print(f"=== Starting concurrent hospital load against {TARGET_ADDR} ===", flush=True)
    threads = []
    for i in range(1, 11):
        t = threading.Thread(target=send_request, args=(i,))
        threads.append(t)
        t.start()

    for t in threads:
        t.join()
    print("=== Load simulation batch completed ===", flush=True)