import sys
import time
import random
import threading
from concurrent import futures
import grpc

import hospital_pb2
import hospital_pb2_grpc

from net_config import ALL_NODES

HEARTBEAT_INTERVAL = 0.5
ELECTION_TIMEOUT_RANGE = (1.5, 3.0)

class RaftNode(hospital_pb2_grpc.RaftServiceServicer, hospital_pb2_grpc.LockServiceServicer):
    def __init__(self, node_id):
        self.id = node_id
        self.peers = {n: addr for n, addr in ALL_NODES.items() if n != node_id}
        self.lock = threading.Lock()
        
        self.state = "FOLLOWER"
        self.current_term = 0
        self.voted_for = None
        self.leader_id = None
        self.last_heartbeat = time.time()

    def log(self, msg):
        print(f"[{self.id} term={self.current_term} {self.state}] {msg}", flush=True)

    def _reset_election_timer(self):
        self.last_heartbeat = time.time()

    def _random_timeout(self):
        return random.uniform(*ELECTION_TIMEOUT_RANGE)

    def RequestVote(self, request, context):
        with self.lock:
            if request.term > self.current_term:
                self.current_term = request.term
                self.voted_for = None
                self.state = "FOLLOWER"

            grant = (
                request.term >= self.current_term and
                self.voted_for in (None, request.candidate_id)
            )

            if grant:
                self.voted_for = request.candidate_id
                self._reset_election_timer()
                self.log(f"Voted for Candidate {request.candidate_id} in term {request.term}")
                return hospital_pb2.VoteReply(term=self.current_term, vote_granted=True)

            return hospital_pb2.VoteReply(term=self.current_term, vote_granted=False)

    def AppendEntries(self, request, context):
        with self.lock:
            if request.term >= self.current_term:
                self.current_term = request.term
                self.state = "FOLLOWER"
                self.leader_id = request.leader_id
                self._reset_election_timer()
                return hospital_pb2.HeartbeatReply(term=self.current_term, success=True)
            return hospital_pb2.HeartbeatReply(term=self.current_term, success=False)

    def AcquireLock(self, request, context):
        with self.lock:
            if self.state != "LEADER":
                hint = self.leader_id or "unknown"
                return hospital_pb2.LockReply(
                    granted=False, 
                    message=f"REJECTED: Not leader. Current leader is Node-{hint}"
                )
            return hospital_pb2.LockReply(
                granted=True, 
                message=f"GRANTED by Leader Node-{self.id} for {request.resource_id}"
            )

    def ReleaseLock(self, request, context):
        return hospital_pb2.LockReply(granted=True, message="RELEASED")

    def _election_watchdog(self):
        while True:
            timeout = self._random_timeout()
            time.sleep(0.1)
            elapsed = time.time() - self.last_heartbeat

            if self.state == "LEADER":
                continue

            if self.state != "LEADER" and elapsed >= timeout:
                self._start_election()

    def _start_election(self):
        with self.lock:
            self.state = "CANDIDATE"
            self.current_term += 1
            self.voted_for = self.id
            term = self.current_term
            self._reset_election_timer()
            self.log(f"Starting election for term {term}")

        votes = 1
        for peer_id, addr in self.peers.items():
            try:
                with grpc.insecure_channel(addr) as channel:
                    stub = hospital_pb2_grpc.RaftServiceStub(channel)
                    reply = stub.RequestVote(
                        hospital_pb2.VoteRequest(term=term, candidate_id=self.id), 
                        timeout=1
                    )
                    if reply.vote_granted:
                        votes += 1
                    elif reply.term > term:
                        with self.lock:
                            self.current_term = reply.term
                            self.state = "FOLLOWER"
                            self.voted_for = None
                        return
            except grpc.RpcError:
                self.log(f"No response from Node-{peer_id} (node may be down)")

        with self.lock:
            if self.state == "CANDIDATE" and votes > len(ALL_NODES) // 2:
                self.state = "LEADER"
                self.leader_id = self.id
                self.log(f"*** ELECTED LEADER *** ({votes}/{len(ALL_NODES)} votes granted)")
            else:
                self.state = "FOLLOWER"
                self.log(f"Election failed ({votes}/{len(ALL_NODES)} votes). Stepping down to FOLLOWER.")

    def _heartbeat_loop(self):
        while True:
            time.sleep(HEARTBEAT_INTERVAL)
            if self.state != "LEADER":
                continue

            for peer_id, addr in self.peers.items():
                try:
                    with grpc.insecure_channel(addr) as channel:
                        stub = hospital_pb2_grpc.RaftServiceStub(channel)
                        stub.AppendEntries(
                            hospital_pb2.HeartbeatRequest(term=self.current_term, leader_id=self.id),
                            timeout=1
                        )
                except grpc.RpcError:
                    pass

def serve(node_id):
    node = RaftNode(node_id)
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=20))
    hospital_pb2_grpc.add_RaftServiceServicer_to_server(node, server)
    hospital_pb2_grpc.add_LockServiceServicer_to_server(node, server)

    port = ALL_NODES[node_id].split(":")[1]
    
    # CRITICAL: Must bind to 0.0.0.0 inside container
    server.add_insecure_port(f"0.0.0.0:{port}")
    server.start()
    print(f"Hospital Coordinator Node-{node_id} listening on 0.0.0.0:{port}", flush=True)

    threading.Thread(target=node._election_watchdog, daemon=True).start()
    threading.Thread(target=node._heartbeat_loop, daemon=True).start()

    try:
        while True:
            time.sleep(0.5)
    except KeyboardInterrupt:
        server.stop(0)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        sys.exit(1)
    serve(sys.argv[1].upper())