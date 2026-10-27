import time
import threading
import grpc
import hospital_pb2
import hospital_pb2_grpc

REPLICAS = {
    "A": "localhost:60301",
    "B": "localhost:60302",
    "C": "localhost:60303"
}

def save(replica_name, key, content):
    with grpc.insecure_channel(REPLICAS[replica_name]) as channel:
        stub = hospital_pb2_grpc.ReplicaServiceStub(channel)
        ack = stub.SaveValue(hospital_pb2.ValueUpdate(
            key=key, content=content, lamport_timestamp=0, origin_replica=""
        ))
        print(f"[Client] Saved on Replica-{replica_name}: \"{content}\" -> accepted={ack.accepted}, replica_ts={ack.lamport_timestamp}")

def read(replica_name, key):
    with grpc.insecure_channel(REPLICAS[replica_name]) as channel:
        stub = hospital_pb2_grpc.ReplicaServiceStub(channel)
        state = stub.GetValue(hospital_pb2.ValueQuery(key=key))
        return state.content, state.lamport_timestamp, state.origin_replica

def main():
    patient_record_key = "patient-101-vitals"
    print("=== Simulating two concurrent doctor writes hitting DIFFERENT department replicas ===\n")

    t1 = threading.Thread(target=save, args=("A", patient_record_key, "BP: 120/80 - Stable (Dr. Smith)"))
    t2 = threading.Thread(target=save, args=("C", patient_record_key, "BP: 140/90 - Elevated (Dr. Dave)"))

    t1.start()
    time.sleep(0.05)  # Near-simultaneous write to create race condition
    t2.start()

    t1.join()
    t2.join()

    print("\n=== Immediately after writes (Replicas may show inconsistency window) ===")
    for name in REPLICAS:
        content, ts, origin = read(name, patient_record_key)
        print(f"Replica-{name}: \"{content}\" (ts={ts}, origin={origin})")

    print("\nWaiting 2s for gossip propagation across all hospital nodes...\n")
    time.sleep(2)

    print("=== After convergence window (Eventual Consistency) ===")
    results = {}
    for name in REPLICAS:
        content, ts, origin = read(name, patient_record_key)
        results[name] = content
        print(f"Replica-{name}: \"{content}\"")

    if len(set(results.values())) == 1:
        print(f"\n*** CONVERGED: All replicas agree on: \"{list(results.values())[0]}\" ***")
    else:
        print(f"\n*** NOT YET CONVERGED: {set(results.values())} ***")

if __name__ == '__main__':
    main()