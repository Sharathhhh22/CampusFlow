import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Settings, ShieldCheck, Database, Building2, Lock, AlertTriangle } from 'lucide-react';

export const AdminSettingsPage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review tenant isolation parameters, security policies, and AI platform configuration.
        </p>
      </div>

      {/* Tenant Identity */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-purple-600" /> Institution Tenant Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Institution Name</span>
            <strong className="text-slate-900 text-sm">Apex Institute of Engineering & Technology</strong>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-slate-400 block mb-0.5">Tenant Slug</span>
            <strong className="text-slate-900 text-sm font-mono">apex-tech</strong>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
            <span className="text-slate-400 block mb-0.5">Partition ID (UUID)</span>
            <strong className="text-slate-700 font-mono text-xs">11111111-1111-1111-1111-111111111111</strong>
          </div>
        </div>
      </div>

      {/* Security Policies */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-600" /> Security & Data Isolation Guarantees
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-emerald-950">PostgreSQL Row-Level Security (RLS)</p>
              <p className="text-emerald-800/80 mt-0.5">
                Enabled on all 14 database tables. Access is strictly partitioned by institution and verified by auth.uid().
              </p>
            </div>
          </div>

          <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sky-950">Independent QR Cryptographic Token Storage</p>
              <p className="text-sky-800/80 mt-0.5">
                Session tokens are cryptographically generated and stored exclusively as SHA-256 hashes on the backend.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900">Institutional Operational Boundary</p>
              <p className="text-slate-600 mt-0.5">
                CampusFlow does not access NIAT's private databases, QR service, or internal APIs. All externally reported attendance issues are marked as unverified until authorized faculty review.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

