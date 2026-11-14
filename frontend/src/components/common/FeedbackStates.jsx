import React from 'react';
import { Loader2, AlertCircle, Inbox, RefreshCw } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', message = 'Loading data...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-sky-600 animate-spin`} />
      {message && <p className="text-sm font-medium text-slate-500">{message}</p>}
    </div>
  );
};

export const ErrorState = ({ title = 'Failed to load content', message, onRetry }) => {
  return (
    <div className="p-6 bg-rose-50/70 border border-rose-200/80 rounded-xl text-center max-w-lg mx-auto my-6">
      <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-rose-900 mb-1">{title}</h3>
      <p className="text-sm text-rose-700 mb-4">{message || 'An unexpected error occurred while communicating with the server.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      )}
    </div>
  );
};

export const EmptyState = ({ title = 'No records found', message = 'There are no items matching this criteria.', action }) => {
  return (
    <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl my-6 bg-slate-50/50">
      <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
        <Inbox className="w-6 h-6" />
      </div>
      <h4 className="text-base font-medium text-slate-800 mb-1">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">{message}</p>
      {action}
    </div>
  );
};

export const StatusBadge = ({ status }) => {
  const config = {
    // Case statuses
    submitted: { label: 'Submitted', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    under_investigation: { label: 'Under AI Investigation', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    awaiting_student_info: { label: 'Awaiting Student Info', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    pending_faculty_review: { label: 'Pending Faculty Review', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    approved: { label: 'Approved & Recovered', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    rejected: { label: 'Rejected', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    closed: { label: 'Closed', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
    
    // Attendance statuses
    present: { label: 'Present', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    recovered: { label: 'Recovered (Approved)', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
    absent: { label: 'Absent', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
    excused: { label: 'Excused', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300' },
    
    // Session statuses
    active: { label: 'Active Session', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    expired: { label: 'Expired', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
  };

  const item = config[status] || { label: status, bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${item.bg} ${item.text} ${item.border}`}>
      {item.label}
    </span>
  );
};

