import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Phone,
  MapPin,
  Trash2,
  Edit2,
  Eye,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';

export const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editingPatient, setEditingPatient] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    age: '',
    phone: '',
    address: '',
  });

  const loadPatients = async () => {
    try {
      const data = await api.getPatients();
      setPatients(data);
    } catch (err) {
      toast.error('Failed to retrieve patient registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const openCreateModal = () => {
    setEditingPatient(null);
    setFormData({
      name: '',
      gender: 'Male',
      age: '',
      phone: '',
      address: '',
    });
    setIsFormModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingPatient(p);
    setFormData({
      name: p.name,
      gender: p.gender || 'Male',
      age: p.age || '',
      phone: p.phone || '',
      address: p.address || '',
    });
    setIsFormModalOpen(true);
  };

  const openDetailModal = (p) => {
    setSelectedPatient(p);
    setIsDetailModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Patient full name is required');
      return;
    }
    setSubmitting(true);
    try {
      if (editingPatient) {
        await api.updatePatient(editingPatient.id, formData);
        toast.success('Patient records updated');
      } else {
        await api.createPatient(formData);
        toast.success('Patient registered successfully');
      }
      setIsFormModalOpen(false);
      loadPatients();
    } catch (err) {
      toast.error('Failed to save patient records');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient profile?')) return;
    try {
      await api.deletePatient(id);
      toast.success('Patient profile removed');
      setPatients(patients.filter((p) => p.id !== id));
    } catch (err) {
      toast.error('Failed to remove patient profile');
    }
  };

  const filteredPatients = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.phone || '').toLowerCase().includes(q) ||
      (p.address || '').toLowerCase().includes(q) ||
      String(p.id).includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#111827]">Patient Directory & Records</h2>
          <p className="text-xs text-[#64748B]">Admitted and registered patients in clinical care</p>
        </div>
        <Button onClick={openCreateModal} icon={Plus}>
          Register New Patient
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by patient name, ID, phone number or ward..."
          className="w-full sm:w-96"
        />
        <div className="text-xs font-semibold text-slate-500">
          Showing {filteredPatients.length} of {patients.length} patients
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingState message="Fetching patient directory..." />
      ) : filteredPatients.length === 0 ? (
        <EmptyState
          title="No patients found"
          description={search ? 'No patients matching your search criteria.' : 'Begin by registering patients into the system.'}
          actionLabel="Register Patient"
          onAction={openCreateModal}
          icon={Users}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Patient ID</th>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Age / Gender</th>
                  <th className="py-3.5 px-4">Phone Contact</th>
                  <th className="py-3.5 px-4">Ward / Address</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-blue-600">
                      #PT-{String(p.id).padStart(4, '0')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#111827] flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                          {p.name.charAt(0)}
                        </div>
                        {p.name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-700">
                      <span className="font-medium">{p.gender}</span>, {p.age} yrs
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {p.phone || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {p.address || 'Standard Care Unit'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openDetailModal(p)}
                          className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Information"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Patient"
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

      {/* Patient Register / Edit Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingPatient ? 'Update Patient Records' : 'Register New Patient'}
        subtitle="Complete the clinical intake form to create or update patient records."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Legal Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Johnathan Doe"
              required
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Age *</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="e.g. 35"
                min="0"
                max="130"
                required
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Residential Address / Hospital Bed Location
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 123 Health Ave, Ward 4B"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsFormModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingPatient ? 'Save Updates' : 'Complete Intake'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Patient Detail Profile Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Patient Medical Profile"
        subtitle={`System ID: #PT-${String(selectedPatient?.id).padStart(4, '0')}`}
      >
        {selectedPatient && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                {selectedPatient.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">{selectedPatient.name}</h4>
                <p className="text-xs text-slate-500">
                  {selectedPatient.gender} • {selectedPatient.age} years old
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block uppercase">Phone Number</span>
                <span className="text-slate-800 font-medium text-sm mt-0.5 block">
                  {selectedPatient.phone || 'Unlisted'}
                </span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-slate-400 font-semibold block uppercase">Assigned Location</span>
                <span className="text-slate-800 font-medium text-sm mt-0.5 block truncate">
                  {selectedPatient.address || 'Standard Ward'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
              <div className="text-xs font-semibold text-blue-900 mb-1 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                Electronic Health Record (EHR) Status
              </div>
              <p className="text-xs text-blue-800">
                Patient records verified. Linked to hospital gRPC synchronization & distributed database.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setIsDetailModalOpen(false)} variant="secondary">
                Close Profile
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Patients;
