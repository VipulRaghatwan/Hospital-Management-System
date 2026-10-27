import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Plus,
  Trash2,
  Edit2,
  FileText,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/common/Button';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';
import LoadingState from '../components/common/LoadingState';
import EmptyState from '../components/common/EmptyState';
import api from '../services/api';

export const LabTests = () => {
  const [labTests, setLabTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: 1,
    type: '',
    result: 'Pending Verification',
  });

  const loadData = async () => {
    try {
      const [testData, patData] = await Promise.all([
        api.getLabTests(),
        api.getPatients(),
      ]);
      setLabTests(testData);
      setPatients(patData);
    } catch (err) {
      toast.error('Failed to retrieve laboratory diagnostics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingTest(null);
    setFormData({
      patient_id: patients[0]?.id || 1,
      type: '',
      result: 'Pending Laboratory Analysis',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingTest(t);
    setFormData({
      patient_id: t.patient_id,
      type: t.type,
      result: t.result || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.type) {
      toast.error('Test type or panel name is required');
      return;
    }
    setSubmitting(true);
    try {
      if (editingTest) {
        await api.updateLabTest(editingTest.id, formData);
        toast.success('Laboratory test results updated');
      } else {
        await api.createLabTest(formData);
        toast.success('New laboratory order dispatched');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      toast.error('Failed to save laboratory record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lab diagnostic entry?')) return;
    try {
      await api.deleteLabTest(id);
      toast.success('Lab test entry deleted');
      setLabTests(labTests.filter((t) => t.id !== id));
    } catch (err) {
      toast.error('Failed to delete lab test');
    }
  };

  const getPatientName = (patientId) => {
    const p = patients.find((pat) => pat.id === patientId);
    return p ? p.name : `Patient #${patientId}`;
  };

  const filteredTests = labTests.filter((t) => {
    const q = search.toLowerCase();
    const pName = getPatientName(t.patient_id).toLowerCase();
    return (
      (t.type || '').toLowerCase().includes(q) ||
      (t.result || '').toLowerCase().includes(q) ||
      pName.includes(q) ||
      String(t.id).includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#111827]">Laboratory Diagnostics & Pathology</h2>
          <p className="text-xs text-[#64748B]">Diagnostic specimens, lab analysis, and test orders</p>
        </div>
        <Button onClick={openCreateModal} icon={Plus}>
          Order Lab Test
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-xs">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by test type, patient name, result, or test ID..."
          className="w-full sm:w-96"
        />
        <div className="text-xs font-semibold text-slate-500">
          Showing {filteredTests.length} of {labTests.length} diagnostics
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingState message="Fetching pathology and laboratory records..." />
      ) : filteredTests.length === 0 ? (
        <EmptyState
          title="No laboratory tests found"
          description={search ? 'No tests matching your query.' : 'Submit a diagnostic order to track results.'}
          actionLabel="Order First Test"
          onAction={openCreateModal}
          icon={FlaskConical}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Sample ID</th>
                  <th className="py-3.5 px-4">Diagnostic Test Type</th>
                  <th className="py-3.5 px-4">Patient Name</th>
                  <th className="py-3.5 px-4">Clinical Findings / Result</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-xs font-semibold text-blue-600">
                      #LAB-{String(test.id).padStart(4, '0')}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#111827] flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-teal-600" />
                        {test.type}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                      {getPatientName(test.patient_id)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 max-w-sm">
                      <span className="font-medium text-slate-800">{test.result}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={test.result?.toLowerCase().includes('pending') ? 'Pending' : 'Completed'} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(test)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Update Results"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(test.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Diagnostic"
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

      {/* Order / Update Lab Test Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTest ? 'Update Diagnostic Findings' : 'Order New Diagnostic Panel'}
        subtitle="Submit specimen laboratory order or update authenticated test results."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Patient *
            </label>
            <select
              value={formData.patient_id}
              onChange={(e) => setFormData({ ...formData, patient_id: Number(e.target.value) })}
              required
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (ID: #PT-{String(p.id).padStart(4, '0')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Test Type / Clinical Panel *
            </label>
            <input
              type="text"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              placeholder="e.g. Complete Blood Count (CBC), Urine Analysis, MRI Scan..."
              required
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Diagnostic Finding / Test Result *
            </label>
            <textarea
              rows={3}
              value={formData.result}
              onChange={(e) => setFormData({ ...formData, result: e.target.value })}
              placeholder="e.g. Normal readings, Pending Lab Analysis, or exact lab parameters..."
              required
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              {editingTest ? 'Save Findings' : 'Dispatch Order'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LabTests;
