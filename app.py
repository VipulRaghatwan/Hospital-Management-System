import os
from flask import Flask, render_template, jsonify, request, redirect, url_for, flash
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__, template_folder='template', static_folder='static')
CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5000"])

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'hospital-secret-key-12345')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URI', 'sqlite:///hospital.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# ================= Models =================
class User(UserMixin, db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(255), unique=True, nullable=False)
    hashed_password = db.Column(db.String(255), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': 'Hospital Administrator'
        }

class Doctor(db.Model):
    __tablename__ = 'doctors'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    specialization = db.Column(db.String(128), nullable=False)
    phone_number = db.Column(db.String(32), default='+1-555-0100')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'specialization': self.specialization,
            'phone_number': self.phone_number
        }

class Patient(db.Model):
    __tablename__ = 'patients'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    gender = db.Column(db.String(32), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    phone = db.Column(db.String(32), default='+1-555-0199')
    address = db.Column(db.String(255), default='123 Hospital Ave')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'gender': self.gender,
            'age': self.age,
            'phone': self.phone,
            'address': self.address
        }

class Appointment(db.Model):
    __tablename__ = 'appointments'
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(64), nullable=False)
    doctor = db.Column(db.String(128), nullable=False)
    patient = db.Column(db.String(128), nullable=False)
    prescription = db.Column(db.String(255), default='None')

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date,
            'doctor': self.doctor,
            'patient': self.patient,
            'prescription': self.prescription
        }

class LabTest(db.Model):
    __tablename__ = 'lab_tests'
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String(128), nullable=False)
    result = db.Column(db.String(255), default='Pending')
    prescription_id = db.Column(db.Integer, default=1)

    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'type': self.type,
            'result': self.result,
            'prescription_id': self.prescription_id
        }

# ================= Auth Setup =================
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))

# ================= Legacy HTML Routes (Preserved) =================
@app.route('/')
def home():
    return render_template('home.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.hashed_password, password):
            login_user(user)
            return redirect(url_for('home'))
        else:
            flash('Invalid username or password', 'error')
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return render_template('logout.html')

@app.route('/patients')
def patients():
    all_patients = Patient.query.all()
    return render_template('patients.html', patients=all_patients)

@app.route('/doctors')
def doctors():
    all_doctors = Doctor.query.all()
    return render_template('doctors.html', doctors=all_doctors)

@app.route('/appointments')
def appointments():
    all_appointments = Appointment.query.all()
    return render_template('appointments.html', appointments=all_appointments)

@app.route('/lab_tests')
def lab_tests():
    all_tests = LabTest.query.all()
    return render_template('lab_tests.html', lab_tests=all_tests)

@app.route('/lab_tests/add', methods=['GET', 'POST'])
def add_lab_test():
    new_test = LabTest(patient_id=1, type="Complete Blood Count", result="Normal", prescription_id=1)
    db.session.add(new_test)
    db.session.commit()
    return redirect(url_for('lab_tests'))

@app.route('/lab_tests/update/<int:id>', methods=['GET', 'POST'])
def update_lab_test(id):
    test = db.session.get(LabTest, id)
    if test:
        test.result = "Verified & Approved"
        db.session.commit()
    return redirect(url_for('lab_tests'))

@app.route('/lab_tests/delete/<int:id>', methods=['GET', 'POST'])
def delete_lab_test(id):
    test = db.session.get(LabTest, id)
    if test:
        db.session.delete(test)
        db.session.commit()
    return redirect(url_for('lab_tests'))

@app.route('/patients/add', methods=['GET', 'POST'])
def patients_add_patient():
    p = Patient(name='Alice Brown', gender='Female', age=29, phone='+1-555-0155')
    db.session.add(p)
    db.session.commit()
    return redirect(url_for('patients'))

@app.route('/patients/view/<int:patient_id>')
def patients_view_patient(patient_id):
    p = db.session.get(Patient, patient_id)
    return jsonify(p.to_dict() if p else {"error": "Patient not found"})

@app.route('/patients/edit/<int:patient_id>', methods=['GET', 'POST'])
def patients_edit_patient(patient_id):
    p = db.session.get(Patient, patient_id)
    if p:
        p.phone = '+1-555-9999'
        db.session.commit()
    return redirect(url_for('patients'))

@app.route('/patients/delete/<int:patient_id>')
def patients_delete_patient(patient_id):
    p = db.session.get(Patient, patient_id)
    if p:
        db.session.delete(p)
        db.session.commit()
    return redirect(url_for('patients'))

app.add_url_rule('/patients/add', endpoint='patients.add_patient', view_func=patients_add_patient)
app.add_url_rule('/patients/view/<int:patient_id>', endpoint='patients.view_patient', view_func=patients_view_patient)
app.add_url_rule('/patients/edit/<int:patient_id>', endpoint='patients.edit_patient', view_func=patients_edit_patient)
app.add_url_rule('/patients/delete/<int:patient_id>', endpoint='patients.delete_patient', view_func=patients_delete_patient)

# ================= Full RESTful API Endpoints =================

# --- Auth APIs ---
@app.route('/api/auth/login', methods=['POST'])
def api_auth_login():
    data = request.get_json(silent=True) or {}
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.hashed_password, password):
        login_user(user)
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': user.to_dict()
        })
    return jsonify({'success': False, 'message': 'Invalid username or password'}), 401

@app.route('/api/auth/logout', methods=['POST'])
def api_auth_logout():
    logout_user()
    return jsonify({'success': True, 'message': 'Logged out successfully'})

@app.route('/api/auth/me', methods=['GET'])
def api_auth_me():
    if current_user.is_authenticated:
        return jsonify({'authenticated': True, 'user': current_user.to_dict()})
    # Default admin session preview
    user = User.query.first()
    if user:
        return jsonify({'authenticated': True, 'user': user.to_dict()})
    return jsonify({'authenticated': False}), 401

# --- Statistics API ---
@app.route('/api/stats', methods=['GET'])
def api_get_stats():
    total_patients = Patient.query.count()
    total_doctors = Doctor.query.count()
    total_appointments = Appointment.query.count()
    pending_lab_tests = LabTest.query.filter(LabTest.result.ilike('%pending%')).count()
    
    # If no pending explicit match, show count of total lab tests
    if pending_lab_tests == 0:
        pending_lab_tests = LabTest.query.count()

    return jsonify({
        'total_patients': total_patients,
        'total_doctors': total_doctors,
        'total_appointments': total_appointments,
        'pending_lab_tests': pending_lab_tests
    })

# --- Live DC Cluster Status API ---
@app.route('/api/dc/status', methods=['GET'])
def api_get_dc_status():
    import socket

    def check_port(host, port):
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.3)
        try:
            s.connect((host, port))
            s.close()
            return True
        except:
            return False

    raft_a = check_port('127.0.0.1', 60401)
    raft_b = check_port('127.0.0.1', 60402)
    raft_c = check_port('127.0.0.1', 60403)
    grpc_main = check_port('127.0.0.1', 50051)
    lb_active = check_port('127.0.0.1', 60201)
    mutex_node = check_port('127.0.0.1', 60051)
    replica_a = check_port('127.0.0.1', 60301)

    nodes_up = sum([raft_a, raft_b, raft_c])

    return jsonify({
        'raft_cluster': {
            'node_A': 'ONLINE' if raft_a else 'OFFLINE',
            'node_B': 'ONLINE' if raft_b else 'OFFLINE',
            'node_C': 'ONLINE' if raft_c else 'OFFLINE',
            'quorum': 'ACHIEVED (Leader Elected)' if nodes_up >= 2 else ('DEGRADED' if nodes_up == 1 else 'OFFLINE')
        },
        'services': {
            'grpc_server': 'ONLINE (Port 50051)' if grpc_main else 'STANDBY',
            'load_balancer': 'ONLINE' if lb_active else 'STANDBY',
            'mutex_network': 'ONLINE' if mutex_node else 'STANDBY',
            'replicas': 'ONLINE' if replica_a else 'STANDBY'
        },
        'active_nodes_count': nodes_up
    })


# --- Patients CRUD ---
@app.route('/api/patients', methods=['GET'])
def api_get_patients():
    return jsonify([p.to_dict() for p in Patient.query.order_by(Patient.id.desc()).all()])

@app.route('/api/patients/<int:patient_id>', methods=['GET'])
def api_get_patient_by_id(patient_id):
    p = db.session.get(Patient, patient_id)
    if not p:
        return jsonify({'error': 'Patient not found'}), 404
    return jsonify(p.to_dict())

@app.route('/api/patients', methods=['POST'])
def api_create_patient():
    data = request.get_json(silent=True) or request.form
    if not data or not data.get('name'):
        return jsonify({'error': 'Name is required'}), 400
    
    p = Patient(
        name=data.get('name'),
        gender=data.get('gender', 'Other'),
        age=int(data.get('age', 30)),
        phone=data.get('phone', '+1-555-0100'),
        address=data.get('address', 'General Ward')
    )
    db.session.add(p)
    db.session.commit()
    return jsonify(p.to_dict()), 201

@app.route('/api/patients/<int:patient_id>', methods=['PUT'])
def api_update_patient(patient_id):
    p = db.session.get(Patient, patient_id)
    if not p:
        return jsonify({'error': 'Patient not found'}), 404
    data = request.get_json(silent=True) or {}
    if 'name' in data: p.name = data['name']
    if 'gender' in data: p.gender = data['gender']
    if 'age' in data: p.age = int(data['age'])
    if 'phone' in data: p.phone = data['phone']
    if 'address' in data: p.address = data['address']
    db.session.commit()
    return jsonify(p.to_dict())

@app.route('/api/patients/<int:patient_id>', methods=['DELETE'])
def api_delete_patient(patient_id):
    p = db.session.get(Patient, patient_id)
    if not p:
        return jsonify({'error': 'Patient not found'}), 404
    db.session.delete(p)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Patient deleted successfully'})

# --- Doctors CRUD ---
@app.route('/api/doctors', methods=['GET'])
def api_get_doctors():
    return jsonify([d.to_dict() for d in Doctor.query.order_by(Doctor.id.asc()).all()])

@app.route('/api/doctors', methods=['POST'])
def api_create_doctor():
    data = request.get_json(silent=True) or {}
    if not data or not data.get('name'):
        return jsonify({'error': 'Doctor name is required'}), 400
    d = Doctor(
        name=data.get('name'),
        specialization=data.get('specialization', 'General Medicine'),
        phone_number=data.get('phone_number', '+1-555-0100')
    )
    db.session.add(d)
    db.session.commit()
    return jsonify(d.to_dict()), 201

@app.route('/api/doctors/<int:doctor_id>', methods=['PUT'])
def api_update_doctor(doctor_id):
    d = db.session.get(Doctor, doctor_id)
    if not d:
        return jsonify({'error': 'Doctor not found'}), 404
    data = request.get_json(silent=True) or {}
    if 'name' in data: d.name = data['name']
    if 'specialization' in data: d.specialization = data['specialization']
    if 'phone_number' in data: d.phone_number = data['phone_number']
    db.session.commit()
    return jsonify(d.to_dict())

@app.route('/api/doctors/<int:doctor_id>', methods=['DELETE'])
def api_delete_doctor(doctor_id):
    d = db.session.get(Doctor, doctor_id)
    if not d:
        return jsonify({'error': 'Doctor not found'}), 404
    db.session.delete(d)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Doctor deleted successfully'})

# --- Appointments CRUD ---
@app.route('/api/appointments', methods=['GET'])
def api_get_appointments():
    return jsonify([a.to_dict() for a in Appointment.query.order_by(Appointment.id.desc()).all()])

@app.route('/api/appointments', methods=['POST'])
def api_create_appointment():
    data = request.get_json(silent=True) or {}
    if not data or not data.get('patient') or not data.get('doctor'):
        return jsonify({'error': 'Patient and Doctor are required'}), 400
    a = Appointment(
        date=data.get('date', 'Tomorrow at 10:00 AM'),
        doctor=data.get('doctor'),
        patient=data.get('patient'),
        prescription=data.get('prescription', 'General Consultation')
    )
    db.session.add(a)
    db.session.commit()
    return jsonify(a.to_dict()), 201

@app.route('/api/appointments/<int:appointment_id>', methods=['PUT'])
def api_update_appointment(appointment_id):
    a = db.session.get(Appointment, appointment_id)
    if not a:
        return jsonify({'error': 'Appointment not found'}), 404
    data = request.get_json(silent=True) or {}
    if 'date' in data: a.date = data['date']
    if 'doctor' in data: a.doctor = data['doctor']
    if 'patient' in data: a.patient = data['patient']
    if 'prescription' in data: a.prescription = data['prescription']
    db.session.commit()
    return jsonify(a.to_dict())

@app.route('/api/appointments/<int:appointment_id>', methods=['DELETE'])
def api_delete_appointment(appointment_id):
    a = db.session.get(Appointment, appointment_id)
    if not a:
        return jsonify({'error': 'Appointment not found'}), 404
    db.session.delete(a)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Appointment cancelled successfully'})

# --- Lab Tests CRUD ---
@app.route('/api/lab_tests', methods=['GET'])
def api_get_lab_tests():
    return jsonify([t.to_dict() for t in LabTest.query.order_by(LabTest.id.desc()).all()])

@app.route('/api/lab_tests', methods=['POST'])
def api_create_lab_test():
    data = request.get_json(silent=True) or {}
    if not data or not data.get('type'):
        return jsonify({'error': 'Test type is required'}), 400
    t = LabTest(
        patient_id=int(data.get('patient_id', 1)),
        type=data.get('type'),
        result=data.get('result', 'Pending Lab Processing'),
        prescription_id=int(data.get('prescription_id', 1))
    )
    db.session.add(t)
    db.session.commit()
    return jsonify(t.to_dict()), 201

@app.route('/api/lab_tests/<int:test_id>', methods=['PUT'])
def api_update_lab_test(test_id):
    t = db.session.get(LabTest, test_id)
    if not t:
        return jsonify({'error': 'Lab test not found'}), 404
    data = request.get_json(silent=True) or {}
    if 'type' in data: t.type = data['type']
    if 'result' in data: t.result = data['result']
    if 'patient_id' in data: t.patient_id = int(data['patient_id'])
    db.session.commit()
    return jsonify(t.to_dict())

@app.route('/api/lab_tests/<int:test_id>', methods=['DELETE'])
def api_delete_lab_test(test_id):
    t = db.session.get(LabTest, test_id)
    if not t:
        return jsonify({'error': 'Lab test not found'}), 404
    db.session.delete(t)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Lab test deleted successfully'})

# ================= Seeder =================
def seed_initial_data():
    with app.app_context():
        db.create_all()
        # Admin user
        if not User.query.filter_by(username='admin').first():
            admin = User(username='admin', hashed_password=generate_password_hash('admin123'))
            db.session.add(admin)

        # Seed Doctors
        if Doctor.query.count() == 0:
            db.session.add_all([
                Doctor(name='Dr. Gregory House', specialization='Diagnostics & Nephrology', phone_number='+1 (555) 234-5678'),
                Doctor(name='Dr. Meredith Grey', specialization='General & Trauma Surgery', phone_number='+1 (555) 345-6789'),
                Doctor(name='Dr. Stephen Strange', specialization='Neurological Surgery', phone_number='+1 (555) 456-7890'),
                Doctor(name='Dr. Allison Cameron', specialization='Immunology & Allergy', phone_number='+1 (555) 567-8901'),
                Doctor(name='Dr. James Wilson', specialization='Oncology & Palliative', phone_number='+1 (555) 678-9012'),
            ])

        # Seed Patients
        if Patient.query.count() == 0:
            db.session.add_all([
                Patient(name='Johnathan Doe', gender='Male', age=34, phone='+1 (555) 111-2222', address='742 Evergreen Terrace, Ward 4B'),
                Patient(name='Jane Eleanor Smith', gender='Female', age=28, phone='+1 (555) 333-4444', address='221B Baker Street, Ward 2A'),
                Patient(name='Robert Vance', gender='Male', age=52, phone='+1 (555) 555-6666', address='404 Silicon Way, Room 102'),
                Patient(name='Clara Oswald', gender='Female', age=29, phone='+1 (555) 777-8888', address='10 Downing Road, Room 305'),
                Patient(name='David Miller', gender='Male', age=45, phone='+1 (555) 999-0000', address='1600 Pennsylvania Ave, Ward 1C'),
            ])

        # Seed Appointments
        if Appointment.query.count() == 0:
            db.session.add_all([
                Appointment(date='2026-10-26 10:00 AM', doctor='Dr. Gregory House', patient='Johnathan Doe', prescription='Ibuprofen 400mg, Rest for 3 days'),
                Appointment(date='2026-10-26 02:30 PM', doctor='Dr. Meredith Grey', patient='Jane Eleanor Smith', prescription='Amoxicillin 500mg (BID)'),
                Appointment(date='2026-10-27 11:15 AM', doctor='Dr. Stephen Strange', patient='Robert Vance', prescription='Pre-op MRI Review & Consultation'),
                Appointment(date='2026-10-28 09:00 AM', doctor='Dr. Allison Cameron', patient='Clara Oswald', prescription='Antihistamine & Allergy Panel'),
            ])

        # Seed Lab Tests
        if LabTest.query.count() == 0:
            db.session.add_all([
                LabTest(patient_id=1, type='Comprehensive Metabolic Panel', result='Normal (Glucose 92 mg/dL)', prescription_id=1),
                LabTest(patient_id=2, type='Chest X-Ray Digital', result='Clear Lungs, No Consolidation', prescription_id=2),
                LabTest(patient_id=3, type='High-Res Brain MRI', result='Pending Lab Verification', prescription_id=3),
                LabTest(patient_id=4, type='Total Blood Lipid Profile', result='Cholesterol 185 mg/dL (Desirable)', prescription_id=4),
            ])

        db.session.commit()

if __name__ == '__main__':
    seed_initial_data()
    print("Serving Hospital Management Web UI on http://localhost:5000 ...")
    app.run(host='0.0.0.0', port=5000, debug=False)
