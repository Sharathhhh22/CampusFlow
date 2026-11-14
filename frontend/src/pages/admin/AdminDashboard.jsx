import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, analyticsApi } from '../../services/api';
import { LoadingSpinner, ErrorState } from '../../components/common/FeedbackStates';
import {
  Users,
  Layers,
  QrCode,
  ShieldAlert,
  ArrowRight,
  School,
  Activity,
  FileCheck2
} from 'lucide-react';

export const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [sumRes, logsRes] = await Promise.all([
          analyticsApi.getSummary(),
          adminApi.listAuditLogs()
        ]);

        if (sumRes.success) setSummary(sumRes.data);
        if (logsRes.success) setAuditLogs(logsRes.data?.slice(0, 8) || []);
      } catch (err) {
        setError(err.message || 'Failed to load administration console');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading institutional administration console..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Institutional Governance
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Administrator Console</h1>
          <p className="text-sm text-slate-500 mt-1">
            Apex Institute of Engineering & Technology • Multi-tenant management & security oversight.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-purple-200"
          >
            <Users className="w-4 h-4" /> Manage Users
          </Link>
          <Link
            to="/admin/classes"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-sm font-semibold transition"
          >
            <Layers className="w-4 h-4" /> Class Sections
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Enrolled</span>
          <div className="text-3xl font-black text-slate-900 mt-2">{summary?.total_students || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Active student profiles</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total QR Sessions</span>
          <div className="text-3xl font-black text-slate-900 mt-2">{summary?.total_sessions || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Independent attendance sessions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Check-in Ledger</span>
          <div className="text-3xl font-black text-emerald-600 mt-2">{summary?.valid_submissions || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Verified attendance submissions</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Investigations</span>
          <div className="text-3xl font-black text-indigo-600 mt-2">{summary?.total_agent_investigations || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Agent runs recorded</p>
        </div>
      </div>

      {/* Audit Log Overview */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Institutional Audit Trail</h3>
              <p className="text-xs text-slate-500">Immutable ledger of sensitive operations and faculty decisions.</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">Latest 8 Events</span>
        </div>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No recent audit events.</p>
        ) : (
          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 mr-2">{log.action?.replace(/_/g, ' ')}</span>
                  <span className="text-slate-500">
                    by <strong>{log.actor_name || 'System'}</strong> on {log.entity_type} #{log.entity_id?.slice(0, 8)}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

