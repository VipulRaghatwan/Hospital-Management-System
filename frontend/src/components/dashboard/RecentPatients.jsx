import React from 'react';
import { ArrowRight, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RecentPatients = ({ patients = [] }) => {
  return (
    <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-[#111827] dark:text-white">Recent Inpatient & Outpatient Registrations</h3>
          <p className="text-xs text-[#64748B] dark:text-slate-400">Newly admitted or consulted patients in the facility</p>
        </div>
        <Link
          to="/patients"
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 pl-2">Patient ID</th>
              <th className="pb-3">Name</th>
              <th className="pb-3">Demographics</th>
              <th className="pb-3">Contact</th>
              <th className="pb-3">Assigned Location</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {patients.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                  No registered patients found.
                </td>
              </tr>
            ) : (
              patients.slice(0, 5).map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="py-3 pl-2 font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">
                    #PT-{String(patient.id).padStart(4, '0')}
                  </td>
                  <td className="py-3">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">{patient.name}</div>
                  </td>
                  <td className="py-3 text-xs text-slate-600 dark:text-slate-300">
                    {patient.gender}, {patient.age} yrs
                  </td>
                  <td className="py-3 text-xs text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {patient.phone || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-slate-600 dark:text-slate-300">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {patient.address || 'Standard Ward'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentPatients;
