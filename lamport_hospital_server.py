import concurrent.futures
import grpc
from lamport_clock import LamportClock
import hospital_pb2
import hospital_pb2_grpc

class HospitalServiceHandler(hospital_pb2_grpc.HospitalServiceServicer):
    def __init__(self):
        self.clock = LamportClock()
    def CheckAvailability(self, request, context):
        # 1. Update server clock on receive
        self.clock.receive_event(request.lamport_clock)
        print(f"[SERVER] Received CheckAvailability | Doctor ID: {request.doctor_id} | Server Clock: {self.clock.time}")

        # 2. Increment clock for response send event
        response_clock = self.clock.send_event()
        return hospital_pb2.ResponseAvailability(
            available=True,
            message="Doctor Available",
            lamport_clock=response_clock
        )

    def BookAppointment(self, request, context):
        self.clock.receive_event(request.lamport_clock)
        print(f"[SERVER] Received BookAppointment | Patient ID: {request.patient_id} | Server Clock: {self.clock.time}")

        response_clock = self.clock.send_event()
        return hospital_pb2.ResponseAppointment(
            success=True,
            message="Appointment Booked Successfully",
            lamport_clock=response_clock
        )

    def UpdatePatientRecord(self, request, context):
        self.clock.receive_event(request.lamport_clock)
        print(f"[SERVER] Received UpdatePatientRecord | Patient ID: {request.patient_id} | Server Clock: {self.clock.time}")

        response_clock = self.clock.send_event()
        return hospital_pb2.ResponseUpdateRecord(
            success=True,
            message="Patient Record Updated Successfully",
            lamport_clock=response_clock
        )
def serve():
    # Initialize gRPC server with thread pool
    server = grpc.server(concurrent.futures.ThreadPoolExecutor(max_workers=10))
    
    # Add handler to server
    hospital_pb2_grpc.add_HospitalServiceServicer_to_server(HospitalServiceHandler(), server)
    
    # Listen on port 50051
    server.add_insecure_port('[::]:50051')
    print("Hospital Server is running on port 50051...")
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()