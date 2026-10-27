import grpc
from concurrent import futures

import hospital_pb2
import hospital_pb2_grpc

class HospitalServiceServicer(hospital_pb2_grpc.HospitalServiceServicer):
    def GetPatientDetails(self, request, context):
        print(f"Fetching details for Patient ID: {request.patient_id}")
        return hospital_pb2.PatientResponse(
            patient_id=request.patient_id,
            name="John Doe",
            age=34,
            condition="Stable"
        )

    def BookAppointment(self, request, context):
        print(f"Booking appointment for Patient ID: {request.patient_id} with Dr. {request.doctor_name}")
        return hospital_pb2.AppointmentResponse(
            success=True,
            booking_id="BK-99123",
            message="Appointment successfully booked"
        )

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    hospital_pb2_grpc.add_HospitalServiceServicer_to_server(HospitalServiceServicer(), server)
    server.add_insecure_port('[::]:50051')
    print("Hospital Management gRPC Server Started on Port 50051...")
    server.start()
    server.wait_for_termination()

if __name__ == '__main__':
    serve()