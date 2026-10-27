import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  UserCheck,
  FlaskConical,
  PlusCircle,
  FileText,
  Activity,
  HeartPulse
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/dashboard/StatCard';
import AppointmentChart from '../components/dashboard/AppointmentChart';
import AppointmentOverview from '../components/dashboard/AppointmentOverview';
import RecentPatients from '../components/dashboard/RecentPatients';
import Button from '../components/common/Button';
import LoadingState from '../components/common/LoadingState';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total_patients: 0,
    total_doctors: 0,
    total_appointments: 0,
    pending_lab_tests: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, appData, patData] = await Promise.all([
          api.getStats().catch(() => ({ total_patients: 0, total_doctors: 0, total_appointments: 0, pending_lab_tests: 0 })),
          api.getAppointments().catch(() => []),
          api.getPatients().catch(() => []),
        ]);
        setStats(statsData);
        setAppointments(appData);
        setPatients(patData);
      } catch (err) {
        console.error('Error loading dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return <LoadingState message="Loading hospital administrative statistics..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#2563EB] p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2 border border-blue-400/20">
              <Activity className="w-3.5 h-3.5" /> Clinical Administration Active
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Good day, {user?.username || 'Hospital Administrator'}
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Today is {currentDate}. Facility beds, active appointments, and laboratory diagnostic pipelines are operating within standard parameters.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Button
              onClick={() => navigate('/appointments')}
              variant="primary"
              className="bg-blue-600 hover:bg-blue-500 border border-blue-400/30"
              icon={PlusCircle}
            >
              Book Appointment
            </Button>
            <Button
              onClick={() => navigate('/patients')}
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              icon={Users}
            >
              Register Patient
            </Button>
          </div>
        </div>

        {/* Subtle decorative background circle */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Registered Patients"
          value={stats.total_patients}
          icon={Users}
          color="blue"
          change="+8% this month"
          subtitle="Active Profiles"
        />
        <StatCard
          title="Scheduled Appointments"
          value={stats.total_appointments}
          icon={Calendar}
          color="teal"
          change="On schedule"
          subtitle="Visits"
        />
        <StatCard
          title="Medical Staff Doctors"
          value={stats.total_doctors}
          icon={UserCheck}
          color="indigo"
          change="100% on duty"
          subtitle="Specialists"
        />
        <StatCard
          title="Diagnostic Lab Tests"
          value={stats.pending_lab_tests}
          icon={FlaskConical}
          color="amber"
          change="Samples In Progress"
          subtitle="Tests"
        />
      </div>

      {/* Charts and Upcoming Consultations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AppointmentChart appointments={appointments} />
        </div>
        <div className="lg:col-span-1">
          <AppointmentOverview appointments={appointments} />
        </div>
      </div>

      {/* Recent Patients Table */}
      <RecentPatients patients={patients} />
    </div>
  );
};

export default Dashboard;
