import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  User,
  Trash2,
  Edit2,
  FileText,
  Search,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';

export const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    date: '',
    time: '10:00 AM',
    prescription: '',
  });

  const loadData = async () => {
    try {
      const [appData, docData, patData] = await Promise.all([
        api.getAppointments(),
        api.getDoctors(),
        api.getPatients(),
      ]);
      setAppointments(appData);
      setDoctors(docData);
      setPatients(patData);
    } catch (err) {
      toast.error('Failed to load appointments from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingAppointment(null);
    setFormData({
      patient: patients[0]?.name || '',
      doctor: doctors[0]?.name || '',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      prescription: 'General Health Followup',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (app) => {
    setEditingAppointment(app);
    setFormData({
      patient: app.patient,
      doctor: app.doctor,
      date: app.date?.split(' ')[0] || new Date().toISOString().split('T')[0],
      time: app.date?.split(' ')[1] || '10:00 AM',
      prescription: app.prescription || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient || !formData.doctor) {
      toast.error('Please specify both Patient and Doctor');
      return;
    }
    setSubmitting(true);
    const combinedDate = `${formData.date} ${formData.time}`;
    try {
      if (editingAppointment) {
        await api.updateAppointment(editingAppointment.id, {
          patient: formData.patient,
          doctor: formData.doctor,
          date: combinedDate,
          prescription: formData.prescription,
        });
        toast.success('Appointment updated successfully');
      } else {
        await api.createAppointment({
          patient: formData.patient,
          doctor: formData.doctor,
          date: combinedDate,
          prescription: formData.prescription,
        });
        toast.success('Appointment scheduled successfully');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error('Failed to save appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.deleteAppointment(id);
      toast.success('Appointment cancelled');
      setAppointments(appointments.filter((a) => a.id !== id));
    } catch (err) {
      toast.error('Could not cancel appointment');
    }
  };

  const filteredAppointments = appointments.filter((app) => {
    const q = search.toLowerCase();
    return (
      (app.patient || '').toLowerCase().includes(q) ||
      (app.doctor || '').toLowerCase().includes(q) ||
      (app.prescription || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#111827]">Appointment Management</h2>
          <p className="text-xs text-[#64748B]">Schedule and organize doctor-patient clinical visits</p>
        </div>
        <Button onClick={openCreateModal} icon={Plus}>
          Schedule Appointment
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search appointments by patient, doctor, or treatment..."
          className="w-full sm:w-96"
        />
        <div className="text-xs font-semibold text-slate-500">
          Showing {filteredAppointments.length} of {appointments.length} appointments
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <LoadingState message="Fetching clinic schedules..." />
      ) : filteredAppointments.length === 0 ? (
        <EmptyState
          title="No appointments scheduled"
          description={search ? 'No results matched your search query.' : 'There are no upcoming appointments on the docket.'}
          actionLabel="Book First Appointment"
          onAction={openCreateModal}
          icon={CalendarIcon}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Booking Ref</th>
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-4">Consulting Doctor</th>
                  <th className="py-3.5 px-4">Schedule Date & Time</th>
                  <th className="py-3.5 px-4">Prescription / Notes</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-blue-600">
                      #BK-{String(app.id).padStart(4, '0')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#111827]">{app.patient}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-700 flex items-center gap-1.5 font-medium">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        {app.doctor}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {app.date}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                      {app.prescription || 'Regular Consultation'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status="Confirmed" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(app)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Appointment"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Cancel Appointment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Appointment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAppointment ? 'Modify Appointment' : 'Schedule New Appointment'}
        subtitle="Specify attending doctor, registered patient, and consultation schedule."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Patient *
            </label>
            <input
              type="text"
              list="patient-options"
              value={formData.patient}
              onChange={(e) => setFormData({ ...formData, patient: e.target.value })}
              placeholder="Type patient name or select..."
              required
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <datalist id="patient-options">
              {patients.map((p) => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Doctor *
            </label>
            <input
              type="text"
              list="doctor-options"
              value={formData.doctor}
              onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
              placeholder="Type doctor name or select..."
              required
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <datalist id="doctor-options">
              {doctors.map((d) => (
                <option key={d.id} value={d.name} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Time Slot *</label>
              <select
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:15 AM">11:15 AM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:30 PM">03:30 PM</option>
                <option value="05:00 PM">05:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Prescription / Consultation Reason
            </label>
            <textarea
              rows={2}
              value={formData.prescription}
              onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
              placeholder="e.g. Routine hypertension checkup, Ibuprofen 400mg..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingAppointment ? 'Save Changes' : 'Confirm Appointment'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Appointments;
