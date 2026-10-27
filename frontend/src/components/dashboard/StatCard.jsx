import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'blue', change = '+4% this week', subtitle }) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900',
      ring: 'group-hover:border-blue-300 dark:group-hover:border-blue-700'
    },
    teal: {
      bg: 'bg-teal-50 text-[#0D9488] dark:bg-teal-950/50 dark:text-teal-400',
      border: 'border-teal-100 dark:border-teal-900',
      ring: 'group-hover:border-teal-300 dark:group-hover:border-teal-700'
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400',
      border: 'border-indigo-100 dark:border-indigo-900',
      ring: 'group-hover:border-indigo-300 dark:group-hover:border-indigo-700'
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900',
      ring: 'group-hover:border-amber-300 dark:group-hover:border-amber-700'
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div className={`group bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all duration-200 ${scheme.ring}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-slate-400">{title}</span>
        <div className={`p-2.5 rounded-xl ${scheme.bg} transition-transform group-hover:scale-105`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold text-[#111827] dark:text-white tracking-tight">{value ?? 0}</span>
        {subtitle && <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{subtitle}</span>}
      </div>
      {change && (
        <div className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <span>●</span> {change}
        </div>
      )}
    </div>
  );
};

export default StatCard;
