import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export const UnauthorizedPage = () => {
  const { user } = useAuth();

  const homePath = user?.role === 'admin'
    ? '/admin/dashboard'
    : user?.role === 'faculty'
    ? '/faculty/dashboard'
    : user?.role === 'student'
    ? '/student/dashboard'
    : '/login';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 shadow-sm">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-2xl font-black text-slate-900 mb-2">Access Restricted</h1>
      <p className="text-sm text-slate-600 max-w-md mb-6 leading-relaxed">
        Your current role (<span className="font-semibold text-slate-800 capitalize">{user?.role || 'Guest'}</span>) does not have authorization to view this area. CampusFlow enforces strict role-based route boundaries.
      </p>

      <div className="flex items-center gap-3">
        <Link
          to={homePath}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-bold transition shadow-sm"
        >
          <Home className="w-4 h-4" /> Go to Your Portal
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Home
        </Link>
      </div>
    </div>
  );
};

