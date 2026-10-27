import time
from concurrent import futures
import grpc
import hospital_pb2
import hospital_pb2_grpc

# In-memory hospital record database
PATIENT_DB = {
    1: {"name": "John Doe", "diagnosis": "Cardiac Arrhythmia", "ward": "ICU-3"},
    2: {"name": "Jane Smith", "diagnosis": "Post-op Recovery", "ward": "General-12"},
}

class PatientRecordServicer(hospital_pb2_grpc.PatientRecordServiceServicer):
    def GetPatientRecord(self, request, context):
        pid = request.patient_id
        print(f"[Backend Server] Querying database for Patient ID #{pid}...")
        time.sleep(0.8)  # Simulate database query latency
        
        record = PATIENT_DB.get(pid, {"name": "Unknown", "diagnosis": "None", "ward": "TBD"})
        return hospital_pb2.PatientRecordReply(
            patient_id=pid,
            name=record["name"],
            diagnosis=record["diagnosis"],
            ward=record["ward"]
        )

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    hospital_pb2_grpc.add_PatientRecordServiceServicer_to_server(PatientRecordServicer(), server)
    server.add_insecure_port("localhost:50051")
    server.start()
    print("[Backend Server] Listening on localhost:50051...")
    try:
        while True:
            time.sleep(0.5)
    except KeyboardInterrupt:
        print("\nStopping Backend Server...")
        server.stop(0)

if __name__ == '__main__':
    serve()