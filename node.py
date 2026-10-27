import sys
import time
import threading
from concurrent import futures
import grpc

import hospital_pb2
import hospital_pb2_grpc

PEERS = {
    1: "localhost:60051",
    2: "localhost:60052",
    3: "localhost:60053"
}

class Node:
    def __init__(self, node_id):
        self.id = node_id
        self.peers = {nid: addr for nid, addr in PEERS.items() if nid != node_id}
        self.clock = 0
        self.state = "RELEASED"  # RELEASED -> WANTED -> HELD
        self.request_time = None
        self.lock = threading.Lock()
        self.deferred = []

    def tick(self):
        with self.lock:
            self.clock += 1
            return self.clock

    def update(self, received_ts):
        with self.lock:
            self.clock = max(self.clock, received_ts) + 1
            return self.clock

    def serve(self):
        server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
        hospital_pb2_grpc.add_MutexServiceServicer_to_server(Servicer(self), server)
        server.add_insecure_port(PEERS[self.id])
        server.start()
        print(f"[Node-{self.id}] Server started on {PEERS[self.id]}")
        return server

    def call_with_retry(self, addr, my_ts, max_wait=30):
        deadline = time.time() + max_wait
        while time.time() < deadline:
            try:
                with grpc.insecure_channel(addr) as channel:
                    stub = hospital_pb2_grpc.MutexServiceStub(channel)
                    return stub.RequestAccess(
                        hospital_pb2.AccessRequest(node_id=self.id, timestamp=my_ts),
                        timeout=10
                    )
            except grpc.RpcError:
                time.sleep(0.5)
        raise RuntimeError(f"Could not reach {addr}")

    def request_cs(self):
        my_ts = self.tick()
        with self.lock:
            self.state = "WANTED"
            self.request_time = my_ts
        print(f"\n[Node-{self.id}] WANTS ICU Bed | Request Timestamp: {my_ts}")

        # Request permission from all peers
        for peer_id, addr in self.peers.items():
            print(f"[Node-{self.id}] Requesting permission from Node-{peer_id}...")
            reply = self.call_with_retry(addr, my_ts)
            self.update(reply.timestamp)
            print(f"[Node-{self.id}] Granted permission by Node-{peer_id}")

        # Enter critical section once all peers reply
        with self.lock:
            self.state = "HELD"
        print(f"\n>>> [Node-{self.id}] ENTERED CRITICAL SECTION: Allocating ICU Bed <<<")
        time.sleep(2)  # Critical section task simulation
        self.release_cs()

    def release_cs(self):
        with self.lock:
            self.state = "RELEASED"
            print(f">>> [Node-{self.id}] LEAVING CRITICAL SECTION: ICU Bed Released <<<\n")
            to_release = list(self.deferred)
            self.deferred = []

        # Unblock deferred peers
        for event in to_release:
            event.set()

class Servicer(hospital_pb2_grpc.MutexServiceServicer):
    def __init__(self, node):
        self.node = node

    def RequestAccess(self, request, context):
        node = self.node
        node.update(request.timestamp)

        with node.lock:
            # Ricart-Agrawala Condition: Defer if HELD or WANTED with higher priority
            defer = (
                node.state == "HELD"
                or (node.state == "WANTED" and (node.request_time, node.id) < (request.timestamp, request.node_id))
            )

        if defer:
            print(f"[Node-{node.id}] DEFERS Node-{request.node_id}'s request (Timestamp: {request.timestamp})")
            event = threading.Event()
            with node.lock:
                node.deferred.append(event)
            event.wait()  # Block handler until CS is released
            print(f"[Node-{node.id}] Resuming deferred reply for Node-{request.node_id}")
        else:
            print(f"[Node-{node.id}] GRANTS immediate permission to Node-{request.node_id}")

        send_ts = node.tick()
        return hospital_pb2.AccessReply(node_id=node.id, timestamp=send_ts)

def main():
    if len(sys.argv) < 2:
        print("Usage: python node.py <node_id: 1, 2, or 3>")
        sys.exit(1)

    node = Node(int(sys.argv[1]))
    server = node.serve()

    # 6-second delay to give time to launch all 3 terminals
    time.sleep(6)

    # Compete for Critical Section
    node.request_cs()

    # Keep server running so other peers can still communicate
    print(f"\n[Node-{node.id}] Finished Critical Section. Keeping server active for peers...")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print(f"\n[Node-{node.id}] Stopping server...")
        server.stop(0)

if __name__ == '__main__':
    main()