import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = 'Loading hospital records...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="p-3 bg-blue-50 text-blue-600 rounded-full mb-3">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
};

export default LoadingState;
