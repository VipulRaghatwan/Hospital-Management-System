import axios from 'axios';

// The Flask backend runs on port 5000; in development Vite proxies /api to port 5000
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const api = {
  // Auth
  login: async (username, password) => {
    const res = await apiClient.post('/api/auth/login', { username, password });
    return res.data;
  },
  logout: async () => {
    const res = await apiClient.post('/api/auth/logout');
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/api/auth/me');
    return res.data;
  },

  // Stats
  getStats: async () => {
    const res = await apiClient.get('/api/stats');
    return res.data;
  },

  // Patients
  getPatients: async () => {
    const res = await apiClient.get('/api/patients');
    return res.data;
  },
  getPatient: async (id) => {
    const res = await apiClient.get(`/api/patients/${id}`);
    return res.data;
  },
  createPatient: async (data) => {
    const res = await apiClient.post('/api/patients', data);
    return res.data;
  },
  updatePatient: async (id, data) => {
    const res = await apiClient.put(`/api/patients/${id}`, data);
    return res.data;
  },
  deletePatient: async (id) => {
    const res = await apiClient.delete(`/api/patients/${id}`);
    return res.data;
  },

  // Doctors
  getDoctors: async () => {
    const res = await apiClient.get('/api/doctors');
    return res.data;
  },
  createDoctor: async (data) => {
    const res = await apiClient.post('/api/doctors', data);
    return res.data;
  },
  updateDoctor: async (id, data) => {
    const res = await apiClient.put(`/api/doctors/${id}`, data);
    return res.data;
  },
  deleteDoctor: async (id) => {
    const res = await apiClient.delete(`/api/doctors/${id}`);
    return res.data;
  },

  // Appointments
  getAppointments: async () => {
    const res = await apiClient.get('/api/appointments');
    return res.data;
  },
  createAppointment: async (data) => {
    const res = await apiClient.post('/api/appointments', data);
    return res.data;
  },
  updateAppointment: async (id, data) => {
    const res = await apiClient.put(`/api/appointments/${id}`, data);
    return res.data;
  },
  deleteAppointment: async (id) => {
    const res = await apiClient.delete(`/api/appointments/${id}`);
    return res.data;
  },

  // Lab Tests
  getLabTests: async () => {
    const res = await apiClient.get('/api/lab_tests');
    return res.data;
  },
  createLabTest: async (data) => {
    const res = await apiClient.post('/api/lab_tests', data);
    return res.data;
  },
  updateLabTest: async (id, data) => {
    const res = await apiClient.put(`/api/lab_tests/${id}`, data);
    return res.data;
  },
  deleteLabTest: async (id) => {
    const res = await apiClient.delete(`/api/lab_tests/${id}`);
    return res.data;
  },
};

export default api;
