import React from 'react';
import { FolderSearch } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  title = 'No records found',
  description = 'There are no hospital items matching your criteria.',
  actionLabel,
  onAction,
  icon: Icon = FolderSearch,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-slate-100 shadow-xs">
      <div className="p-3 bg-slate-50 text-slate-400 rounded-full mb-3">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-semibold text-slate-800">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
