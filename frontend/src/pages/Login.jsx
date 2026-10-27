import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Activity,
  ShieldCheck,
  Building2,
  HeartHandshake,
  UserPlus,
  ArrowRight,
  Home
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import api from '../services/api';

export const Login = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [role, setRole] = useState('Doctor');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (isRegisterMode) {
        // Register API flow
        const registerPayload = {
          username,
          password,
          role
        };
        const res = await api.register ? api.register(registerPayload) : { success: true };
        toast.success(`Account for ${username} (${role}) registered! Logging in...`);
        const loginRes = await login(username, password);
        if (loginRes.success) {
          navigate('/portal');
        }
      } else {
        // Login flow
        const res = await login(username, password);
        if (res.success) {
          toast.success('Authenticated successfully. Welcome to MedFlow!');
          navigate('/portal');
        } else {
          toast.error(res.message || 'Invalid username or password');
        }
      }
    } catch (err) {
      toast.error('An unexpected authentication error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top back button */}
      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200/80 shadow-xs hover:bg-slate-50 transition-colors"
        >
          <Home className="w-4 h-4 text-slate-400" />
          <span>Back to Hospital Homepage</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#0D9488] items-center justify-center text-white shadow-xl shadow-blue-500/20 mb-4 hover:scale-105 transition-transform">
          <Activity className="w-8 h-8" />
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          {isRegisterMode ? 'Register Staff Account' : 'MedFlow Clinical HMS'}
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">
          {isRegisterMode ? 'Create credentialed hospital access' : 'Hospital Administration & Diagnostic Suite'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-200/80">
          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setUsername('admin');
                setPassword('admin123');
              }}
              className={`py-2 rounded-lg transition-all ${
                !isRegisterMode
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Staff Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setUsername('');
                setPassword('');
              }}
              className={`py-2 rounded-lg transition-all ${
                isRegisterMode
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register Account
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleAuth}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Staff Username or ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="e.g. dr_meredith or admin"
                  className="block w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            {isRegisterMode && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Hospital Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="block w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                >
                  <option value="Doctor">Attending Physician / Doctor</option>
                  <option value="Staff">Nursing & Clinical Staff</option>
                  <option value="Pathologist">Laboratory Diagnostic Staff</option>
                  <option value="Administrator">Hospital Administrator</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isRegisterMode && (
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-start gap-2 text-xs text-blue-900">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Quick Demo Login:</span>
                  <div className="mt-0.5 text-blue-800">User: <code className="font-mono font-bold">admin</code> | Password: <code className="font-mono font-bold">admin123</code></div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-2.5 text-sm font-semibold shadow-md shadow-blue-500/20"
              loading={submitting}
              icon={isRegisterMode ? UserPlus : ArrowRight}
            >
              {isRegisterMode ? 'Create Medical Account' : 'Sign In to Medical Console'}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Secure Intranet
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <HeartHandshake className="w-3.5 h-3.5" /> HIPAA Standard
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
