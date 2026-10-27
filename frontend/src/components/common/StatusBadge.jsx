import React from 'react';

export const StatusBadge = ({ status }) => {
  const norm = (status || '').toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (norm.includes('completed') || norm.includes('verified') || norm.includes('approved') || norm.includes('clear') || norm.includes('normal')) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (norm.includes('pending') || norm.includes('processing') || norm.includes('review')) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (norm.includes('cancelled') || norm.includes('abnormal') || norm.includes('failed')) {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (norm.includes('scheduled') || norm.includes('active')) {
    styles = 'bg-blue-50 text-blue-700 border-blue-200';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
