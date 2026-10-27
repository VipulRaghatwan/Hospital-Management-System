import grpc
from lamport_clock import LamportClock
import hospital_pb2
import hospital_pb2_grpc

def run():
    client_clock = LamportClock()

    with grpc.insecure_channel('localhost:50051') as channel:
        stub = hospital_pb2_grpc.HospitalServiceStub(channel)

        # 1. CHECK AVAILABILITY
        send_time = client_clock.send_event()
        print("========== CHECK APPOINTMENT AVAILABILITY ==========")
        print(f"Sending Request | Lamport Clock : {send_time}")
        
        req = hospital_pb2.RequestAvailability(doctor_id="D101", lamport_clock=send_time)
        res = stub.CheckAvailability(req)
        
        recv_time = client_clock.receive_event(res.lamport_clock)
        print("\nReceived Response")
        print(f"Lamport Clock : {recv_time}")
        print(f"Available     : {res.available}")
        print(f"Message       : {res.message}\n")

        # 2. BOOK APPOINTMENT
        send_time = client_clock.send_event()
        print("========== BOOK APPOINTMENT ==========")
        print(f"Sending Request | Lamport Clock : {send_time}")

        req = hospital_pb2.RequestAppointment(patient_id="P204", doctor_id="D101", date="2026-05-10", lamport_clock=send_time)
        res = stub.BookAppointment(req)

        recv_time = client_clock.receive_event(res.lamport_clock)
        print("\nReceived Response")
        print(f"Lamport Clock : {recv_time}")
        print(f"Success       : {res.success}")
        print(f"Message       : {res.message}\n")

        # 3. UPDATE PATIENT RECORD
        send_time = client_clock.send_event()
        print("========== UPDATE PATIENT RECORD ==========")
        print(f"Sending Request | Lamport Clock : {send_time}")

        req = hospital_pb2.RequestUpdateRecord(patient_id="P204", diagnosis="Routine Checkup Passed", lamport_clock=send_time)
        res = stub.UpdatePatientRecord(req)

        recv_time = client_clock.receive_event(res.lamport_clock)
        print("\nReceived Response")
        print(f"Lamport Clock : {recv_time}")
        print(f"Success       : {res.success}")
        print(f"Message       : {res.message}")

if __name__ == '__main__':
    run()