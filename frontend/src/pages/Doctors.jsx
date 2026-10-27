import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Phone,
  Award,
  Stethoscope,
  Trash2,
  Edit2,
  Search,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';

export const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    phone_number: '',
  });

  const loadDoctors = async () => {
    try {
      const data = await api.getDoctors();
      setDoctors(data);
    } catch (err) {
      toast.error('Failed to retrieve medical doctors roster');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const openCreateModal = () => {
    setEditingDoctor(null);
    setFormData({
      name: '',
      specialization: 'General Medicine',
      phone_number: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (d) => {
    setEditingDoctor(d);
    setFormData({
      name: d.name,
      specialization: d.specialization || '',
      phone_number: d.phone_number || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Doctor name is required');
      return;
    }
    setSubmitting(true);
    try {
      if (editingDoctor) {
        await api.updateDoctor(editingDoctor.id, formData);
        toast.success('Doctor details updated');
      } else {
        await api.createDoctor(formData);
        toast.success('Doctor registered to staff roster');
      }
      setIsModalOpen(false);
      loadDoctors();
    } catch (err) {
      toast.error('Failed to save doctor details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this doctor from the active staff directory?')) return;
    try {
      await api.deleteDoctor(id);
      toast.success('Doctor removed from staff list');
      setDoctors(doctors.filter((d) => d.id !== id));
    } catch (err) {
      toast.error('Failed to remove doctor');
    }
  };

  const filteredDoctors = doctors.filter((d) => {
    const q = search.toLowerCase();
    return (
      (d.name || '').toLowerCase().includes(q) ||
      (d.specialization || '').toLowerCase().includes(q) ||
      (d.phone_number || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#111827]">Attending Medical Staff</h2>
          <p className="text-xs text-[#64748B]">Physicians, surgeons, and healthcare specialists</p>
        </div>
        <Button onClick={openCreateModal} icon={Plus}>
          Add Attending Doctor
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by doctor name or clinical specialization..."
          className="w-full sm:w-96"
        />
        <div className="text-xs font-semibold text-slate-500">
          {filteredDoctors.length} doctors currently available
        </div>
      </div>

      {/* Main Grid */}
      {loading ? (
        <LoadingState message="Fetching physician directory..." />
      ) : filteredDoctors.length === 0 ? (
        <EmptyState
          title="No doctors found"
          description={search ? 'No doctors matching your query.' : 'Add your facility doctors to enable appointments.'}
          actionLabel="Add Doctor"
          onAction={openCreateModal}
          icon={UserCheck}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    {doc.name.replace('Dr.', '').trim().charAt(0) || 'D'}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> On Duty
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-bold text-[#111827]">{doc.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold mt-1">
                    <Stethoscope className="w-3.5 h-3.5" />
                    {doc.specialization || 'General Practice'}
                  </div>
                </div>

                <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{doc.phone_number || '+1-555-0100'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-slate-400" />
                    <span>Licensed Clinical Practitioner</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <Button
                  onClick={() => openEditModal(doc)}
                  variant="secondary"
                  size="sm"
                  icon={Edit2}
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(doc.id)}
                  variant="ghost"
                  size="sm"
                  className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  icon={Trash2}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Doctor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDoctor ? 'Update Doctor Details' : 'Register Attending Doctor'}
        subtitle="Add physician or clinical specialist to the hospital system."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Doctor Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Dr. Meredith Grey"
              required
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Medical Specialization *
            </label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="e.g. General Surgery, Cardiology, Diagnostics..."
              required
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact Phone Extension
            </label>
            <input
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              placeholder="e.g. +1 (555) 234-5678"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingDoctor ? 'Save Changes' : 'Register Doctor'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Doctors;
