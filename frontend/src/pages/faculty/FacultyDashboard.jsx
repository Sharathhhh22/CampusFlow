import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { analyticsApi, sessionApi, caseApi } from '../../services/api';
import { StatusBadge, LoadingSpinner, ErrorState } from '../../components/common/FeedbackStates';
import {
  Users,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Plus,
  Radio
} from 'lucide-react';

export const FacultyDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [activeSessions, setActiveSessions] = useState([]);
  const [pendingCases, setPendingCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [sumRes, sessRes, casesRes] = await Promise.all([
          analyticsApi.getSummary(),
          sessionApi.list({ status: 'active' }),
          caseApi.list({ status: 'pending_faculty_review', limit: 5 })
        ]);

        if (sumRes.success) setMetrics(sumRes.data);
        if (sessRes.success) setActiveSessions(sessRes.data || []);
        if (casesRes.success) setPendingCases(casesRes.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load command center');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner message="Loading attendance command center..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 px-2.5 py-0.5 rounded-full border border-sky-200 dark:border-sky-800">
              Attendance Command Center
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Faculty Operations • {user?.full_name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor live QR check-ins, oversee AI exception investigations, and authorize attendance corrections.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/faculty/sessions/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-sky-200 dark:shadow-none"
          >
            <Plus className="w-4 h-4" /> Start QR Session
          </Link>
          <Link
            to="/faculty/cases"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition"
          >
            Review Queue ({metrics?.requiring_faculty_review || 0})
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Enrolled Students</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{metrics?.total_students || 0}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active departmental students</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Valid Submissions</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{metrics?.valid_submissions || 0}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Verified QR check-ins recorded</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Pending Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{metrics?.requiring_faculty_review || 0}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cases awaiting faculty decision</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">AI Investigations</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">{metrics?.total_agent_investigations || 0}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Multi-Agent AI runs completed</p>
        </div>
      </div>

      {/* Active Sessions Monitor Card */}
      {activeSessions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Live QR Session</h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              Live Broadcast
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSessions.map((s) => (
              <div key={s.id} className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{s.subject_name} ({s.subject_code})</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Class: {s.class_name} • Attended: {s.attendance_count} students
                  </p>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                    Expires: {new Date(s.expires_at).toLocaleTimeString()}
                  </p>
                </div>
                <Link
                  to={`/faculty/sessions/${s.id}`}
                  className="px-4 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  <QrCode className="w-3.5 h-3.5" /> Open QR Monitor
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Queue Preview */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Cases Requiring Faculty Review</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AI investigation dossiers synthesized and waiting for authorized faculty verdict.
            </p>
          </div>
          <Link
            to="/faculty/cases"
            className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 flex items-center gap-1"
          >
            Open Full Queue <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingCases.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-xs">
            Review queue is clear! All submitted attendance recovery cases have been addressed.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingCases.map((c) => (
              <div
                key={c.id}
                className="p-4 bg-slate-50/70 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{c.student_name}</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{c.subject_name || 'Class Session'}</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                      {c.issue_category?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 italic">"{c.description}"</p>
                </div>
                <Link
                  to={`/faculty/cases/${c.id}`}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs whitespace-nowrap"
                >
                  Inspect & Decide <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

