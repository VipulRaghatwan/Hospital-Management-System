import React from 'react';
import { Calendar, User, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';

export const AppointmentOverview = ({ appointments = [] }) => {
  return (
    <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col h-full transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-[#111827] dark:text-white">Upcoming Appointments</h3>
          <p className="text-xs text-[#64748B] dark:text-slate-400">Next scheduled patient consultations</p>
        </div>
        <Link
          to="/appointments"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto max-h-80">
        {appointments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
            No upcoming appointments scheduled today.
          </div>
        ) : (
          appointments.slice(0, 5).map((app) => (
            <div key={app.id} className="py-3.5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/50 px-2 rounded-lg transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                  {app.patient ? app.patient.slice(0, 2).toUpperCase() : 'PT'}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#111827] dark:text-white">{app.patient}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                    <User className="w-3 h-3 text-slate-400" /> {app.doctor}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 justify-end">
                  <Clock className="w-3 h-3 text-slate-400" /> {app.date}
                </div>
                <div className="mt-1">
                  <StatusBadge status="Scheduled" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AppointmentOverview;
