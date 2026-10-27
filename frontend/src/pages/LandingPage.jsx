import React from 'react';
import {
  Activity,
  Calendar,
  Users,
  UserCheck,
  FlaskConical,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Phone,
  MapPin,
  Stethoscope,
  HeartPulse,
  Sparkles,
  ChevronRight,
  Lock,
  Network
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import ThemeToggle from '../components/common/ThemeToggle';

export const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: 'Patient Management & EHR',
      desc: 'Seamless electronic medical intake, longitudinal patient history, and room allocation records.',
      badge: 'Core Module',
    },
    {
      icon: Calendar,
      title: 'Real-time Appointment Flow',
      desc: 'Automated doctor scheduling with slot availability, doctor matching, and reminder status.',
      badge: 'Automated',
    },
    {
      icon: UserCheck,
      title: 'Medical Staff & Specialists',
      desc: 'Centralized physician credentialing, duty roster tracking, and departmental assignments.',
      badge: 'Roster',
    },
    {
      icon: FlaskConical,
      title: 'Laboratory Diagnostics',
      desc: 'End-to-end specimen tracking, digital pathology results, and automated patient record linkage.',
      badge: 'Diagnostics',
    },
    {
      icon: Network,
      title: 'Distributed System Engine',
      desc: 'Raft consensus, Lamport logical clocks, mutual exclusion, and least-connection load balancing.',
      badge: 'DC Node',
    },
    {
      icon: ShieldCheck,
      title: 'Enterprise Clinical Security',
      desc: 'Role-based access controls, encrypted patient records, and HIPAA-compliant data standards.',
      badge: 'Security',
    }
  ];

  const stats = [
    { value: '99.98%', label: 'Clinical Uptime' },
    { value: '10 / 10', label: 'DC Modules Active' },
    { value: '< 2 min', label: 'Average Intake Time' },
    { value: '24 / 7', label: 'Emergency Support' },
  ];

  const specialties = [
    'Emergency & Trauma Care',
    'Cardiology & Vascular',
    'Neurological Surgery',
    'Pediatrics & Neonatal',
    'Orthopedics & Joint',
    'Diagnostic Pathology'
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-[#111827] dark:text-slate-100 transition-colors">
      {/* ================= Navigation Bar ================= */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#0D9488] flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-white flex items-center gap-2">
                MedFlow <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold uppercase">HMS</span>
              </span>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 font-medium tracking-wide">CLINICAL HEALTHCARE SUITE</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Key Modules</a>
            <a href="#specialties" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Specialties</a>
            <Link to="/dc-cluster" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
              <Network className="w-4 h-4 text-teal-500" /> DC Cluster
            </Link>
            <a href="#contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Emergency</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark Mode Toggle */}
            <ThemeToggle />

            <Link to="/login">
              <Button variant="secondary" size="md" className="hidden sm:inline-flex border-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700">
                Staff Sign In
              </Button>
            </Link>
            <Link to="/portal">
              <Button variant="primary" size="md" icon={ArrowRight}>
                Open Portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ================= Hero Section ================= */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-6 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Next-Generation Distributed Hospital Information System</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0F172A] dark:text-white tracking-tight leading-[1.15]">
              Intelligent Healthcare Administration,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#0D9488]">
                Simplified.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-[#64748B] dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
              MedFlow unifies patient registration, attending physician scheduling, real-time diagnostic laboratory pathology, and clinical consultations with resilient distributed architecture.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => navigate('/portal')}
                size="lg"
                className="w-full sm:w-auto text-base px-8 py-3.5 shadow-xl shadow-blue-600/25"
                icon={ArrowRight}
              >
                Access Administration Console
              </Button>
              <Button
                onClick={() => navigate('/dc-cluster')}
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto text-base px-6 py-3.5 bg-white dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700"
                icon={Network}
              >
                View DC Cluster Architecture
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Real-time Database Sync
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Raft Consensus & LWW
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Role-Protected EHR
              </span>
            </div>
          </div>

          {/* Interactive Dashboard Preview Frame */}
          <div className="mt-14 relative max-w-5xl mx-auto">
            <div className="rounded-2xl bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-900 p-2 sm:p-3 shadow-2xl">
              <div className="rounded-xl bg-white dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
                {/* Simulated top bar */}
                <div className="bg-slate-900 px-4 py-3 flex items-center justify-between text-xs text-slate-300 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
                    <span className="ml-2 font-mono text-slate-400">https://medflow.hospital.org/portal</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Raft Quorum Active
                  </div>
                </div>

                {/* Dashboard Snapshot Hero Grid */}
                <div className="p-6 bg-[#F8FAFC] dark:bg-[#0B1120] space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Patients</span>
                      <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">1,248</div>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">● Active Registry</span>
                    </div>
                    <div className="p-4 bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase">Appointments</span>
                      <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">42 Today</div>
                      <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">● On Schedule</span>
                    </div>
                    <div className="p-4 bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase">Attending Doctors</span>
                      <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">28 On Duty</div>
                      <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">● 100% Staffed</span>
                    </div>
                    <div className="p-4 bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                      <span className="text-[11px] font-semibold text-slate-400 uppercase">Lab Diagnostics</span>
                      <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">16 Verified</div>
                      <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">● Pathology Sync</span>
                    </div>
                  </div>

                  <div className="p-4 bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-sm">
                        JD
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">Johnathan Doe — Follow-up Consultation</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Dr. Gregory House • Diagnostics Dept • 10:00 AM</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Glowing background aura */}
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-teal-500/10 to-indigo-500/10 blur-2xl -z-10 rounded-3xl"></div>
          </div>
        </div>
      </section>

      {/* ================= Stats Band ================= */}
      <section className="bg-[#0F172A] py-12 text-white border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            {stats.map((s, idx) => (
              <div key={idx} className="pt-4 md:pt-0">
                <div className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
                  {s.value}
                </div>
                <div className="mt-1 text-xs sm:text-sm text-slate-400 font-medium uppercase tracking-wider">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Features Grid ================= */}
      <section id="features" className="py-20 bg-white dark:bg-[#0F172A] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900">
              Complete Hospital Management
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0F172A] dark:text-white mt-3 tracking-tight">
              Clinical Modules Built for Real-World Care
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2">
              Every department connects into the unified MedFlow clinical architecture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200 shadow-xs">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {feat.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-[#111827] dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      {feat.desc}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                    <span>Learn module details</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= Specialties Section ================= */}
      <section id="specialties" className="py-20 bg-slate-50 dark:bg-[#0B1120] border-y border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-3 py-1 rounded-full border border-teal-100 dark:border-teal-900">
                Departments & Units
              </span>
              <h2 className="text-3xl font-bold text-[#0F172A] dark:text-white mt-3 tracking-tight">
                Specialized Clinical Capabilities
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Equipped for modern surgical, diagnostic, and emergency clinical services.
              </p>
            </div>
            <Button onClick={() => navigate('/portal')} icon={ArrowRight}>
              View Doctor Directory
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {specialties.map((spec, i) => (
              <div
                key={i}
                className="p-4 bg-white dark:bg-[#1E293B] rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs text-center hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 mx-auto rounded-xl bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{spec}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Emergency & Contact Section ================= */}
      <section id="contact" className="py-16 bg-white dark:bg-[#0F172A] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#2563EB] p-8 sm:p-12 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between gap-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full border border-rose-500/30">
                24/7 Immediate Care
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-3 tracking-tight">
                Emergency Triage & Ambulatory Assistance
              </h2>
              <p className="text-sm text-slate-300 mt-2 max-w-xl">
                Immediate clinical consultation hotline and automated hospital bed allocation dispatched via our medical control room.
              </p>
              <div className="mt-6 flex flex-wrap gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">+1 (800) 555-0911</span> (Emergency Line)
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>Main Campus, 742 Evergreen Healthcare Blvd</span>
                </div>
              </div>
            </div>
            <div className="shrink-0 flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => navigate('/portal')}
                size="lg"
                className="bg-white text-slate-900 hover:bg-slate-100 font-bold"
                icon={ArrowRight}
              >
                Launch Dashboard
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              M
            </div>
            <span className="text-sm font-bold text-white">MedFlow Hospital Management System</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/portal" className="hover:text-white transition-colors">Clinical Dashboard</Link>
            <Link to="/login" className="hover:text-white transition-colors">Staff Login</Link>
            <Link to="/dc-cluster" className="hover:text-white transition-colors">DC Cluster</Link>
            <a href="#contact" className="hover:text-white transition-colors">Emergency</a>
          </div>

          <div className="text-slate-500">
            © {new Date().getFullYear()} MedFlow HMS. Open-Source Clinical & DC Platform.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
