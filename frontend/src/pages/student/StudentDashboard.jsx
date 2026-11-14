import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { attendanceApi, caseApi, sessionApi } from '../../services/api';
import { StatusBadge, LoadingSpinner, ErrorState } from '../../components/common/FeedbackStates';
import {
  CalendarCheck,
  QrCode,
  LifeBuoy,
  ClipboardList,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Radio
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [cases, setCases] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [histRes, casesRes, sessRes] = await Promise.all([
          attendanceApi.getHistory(),
          caseApi.list({ limit: 5 }),
          sessionApi.list({ status: 'active' })
        ]);

        if (histRes.success) setHistory(histRes.data || []);
        if (casesRes.success) setCases(casesRes.data || []);
        if (sessRes.success) setActiveSessions(sessRes.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard records');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading your attendance dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const totalCheckins = history.length;
  const pendingCases = cases.filter(c => ['submitted', 'under_investigation', 'pending_faculty_review'].includes(c.status)).length;
  const resolvedCases = cases.filter(c => ['approved', 'rejected', 'closed'].includes(c.status)).length;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome back, {user?.full_name}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {user?.department_name || 'B.Tech Computer Science & Engineering'} • Student ID: {user?.id?.slice(0, 8)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/student/scan"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-sky-200"
          >
            <QrCode className="w-4 h-4" /> Check-in via QR
          </Link>
          <Link
            to="/student/report-issue"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-sm font-semibold transition"
          >
            <LifeBuoy className="w-4 h-4" /> Report Issue
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Check-ins</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{totalCheckins}</div>
          <p className="text-xs text-slate-500 mt-1">Verified check-in sessions recorded</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Recovery Cases</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{pendingCases}</div>
          <p className="text-xs text-slate-500 mt-1">Cases currently under AI or faculty review</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Resolved Cases</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900">{resolvedCases}</div>
          <p className="text-xs text-slate-500 mt-1">Reviewed and closed recovery requests</p>
        </div>
      </div>

      {/* Active Attendance Sessions Callout */}
      {activeSessions.length > 0 && (
        <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h3 className="text-sm font-bold text-slate-900">Live Attendance Session in Progress</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Active Now
            </span>
          </div>
          <div className="space-y-3">
            {activeSessions.map((s) => (
              <div key={s.id} className="bg-white p-4 rounded-xl border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{s.subject_name} ({s.subject_code})</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Class: {s.class_name} • Faculty: {s.faculty_name} • Expires in {Math.max(0, Math.round((new Date(s.expires_at) - new Date()) / 60000))} min
                  </p>
                </div>
                <Link
                  to="/student/scan"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition shadow-sm"
                >
                  <QrCode className="w-3.5 h-3.5" /> Scan Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Layout: Recent Attendance & Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">Recent Check-in History</h3>
            <Link to="/student/attendance" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {history.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No check-in records found yet.</p>
          ) : (
            <div className="space-y-3 flex-1">
              {history.slice(0, 5).map((r) => (
                <div key={r.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{r.subject_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(r.recorded_at).toLocaleDateString()} at {new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {r.source}
                    </p>
                  </div>
                  <StatusBadge status={r.attendance_status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Recovery Cases */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">Attendance Recovery Cases</h3>
            <Link to="/student/cases" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {cases.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No recovery requests filed.</p>
          ) : (
            <div className="space-y-3 flex-1">
              {cases.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  to={`/student/cases/${c.id}`}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/70 transition flex items-center justify-between block group"
                >
                  <div className="min-w-0 pr-3">
                    <p className="font-bold text-slate-800 text-sm truncate group-hover:text-sky-600 transition">
                      {c.description}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Category: {c.issue_category?.replace('_', ' ')} • {new Date(c.reported_at || c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={c.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

