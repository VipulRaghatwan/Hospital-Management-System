import grpc
import hospital_pb2
import hospital_pb2_grpc

def run():
    with grpc.insecure_channel('localhost:50051') as channel:
        stub = hospital_pb2_grpc.HospitalServiceStub(channel)
        
        # Call 1: Get Patient Details
        print("Checking Patient Details...")
        response = stub.GetPatientDetails(hospital_pb2.PatientRequest(patient_id="P101"))
        print(f"Patient Name: {response.name}")
        print(f"Age         : {response.age}")
        print(f"Condition   : {response.condition}\n")

        # Call 2: Book Appointment
        print("Booking Appointment...")
        app_response = stub.BookAppointment(
            hospital_pb2.AppointmentRequest(
                patient_id="P101", 
                doctor_name="Smith", 
                appointment_date="2026-08-20"
            )
        )
        print(f"Status     : {app_response.message}")
        print(f"Booking ID : {app_response.booking_id}")

if __name__ == '__main__':
    run()