import sys
import time
import random
from concurrent import futures
import grpc
import hospital_pb2
import hospital_pb2_grpc

class HospitalWorkerServicer(hospital_pb2_grpc.HospitalWorkerServiceServicer):
    def __init__(self, name):
        self.name = name

    def HandleRequest(self, request, context):
        # Simulate variable consultation/processing time
        work_time = random.uniform(0.5, 2.5)
        print(f"[{self.name}] Handling appointment request #{request.request_id} (duration: {work_time:.1f}s)")
        time.sleep(work_time)
        print(f"[{self.name}] Completed appointment request #{request.request_id}")
        return hospital_pb2.WorkReply(
            request_id=request.request_id,
            handled_by=self.name,
            status="done"
        )

def serve(port):
    name = f"Hospital-Server-{port}"
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=20))
    hospital_pb2_grpc.add_HospitalWorkerServiceServicer_to_server(HospitalWorkerServicer(name), server)
    server.add_insecure_port(f"localhost:{port}")
    server.start()
    print(f"[{name}] Listening on localhost:{port}")
    try:
        while True:
            time.sleep(0.5)
    except KeyboardInterrupt:
        print(f"\nStopping {name}...")
        server.stop(0)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python worker_server.py <port>")
        sys.exit(1)
    serve(int(sys.argv[1]))