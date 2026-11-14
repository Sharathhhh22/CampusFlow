import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sessionApi } from '../../services/api';
import { StatusBadge, LoadingSpinner, ErrorState, EmptyState } from '../../components/common/FeedbackStates';
import { QrCode, Plus, Search, Calendar, Users, Eye, XCircle } from 'lucide-react';

export const SessionsListPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await sessionApi.list();
      if (res.success) {
        setSessions(res.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleCloseSession = async (id) => {
    if (!window.confirm('Are you sure you want to end this attendance session? Students will no longer be able to scan.')) {
      return;
    }
    try {
      const res = await sessionApi.close(id);
      if (res.success) {
        fetchSessions();
      }
    } catch (err) {
      alert(err.message || 'Failed to close session');
    }
  };

  if (loading) return <LoadingSpinner message="Loading attendance sessions..." />;
  if (error) return <ErrorState message={error} onRetry={fetchSessions} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Attendance Sessions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, project, and monitor cryptographic QR attendance sessions for your classes.
          </p>
        </div>
        <Link
          to="/faculty/sessions/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-sky-200 dark:shadow-none"
        >
          <Plus className="w-4 h-4" /> Create New Session
        </Link>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          title="No Sessions Created Yet"
          message="Start an attendance session to generate an independent CampusFlow QR code for your class."
          action={
            <Link
              to="/faculty/sessions/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition"
            >
              <Plus className="w-4 h-4" /> Create First Session
            </Link>
          }
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Subject & Code</th>
                  <th className="py-3 px-4">Class Section</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Time Window</th>
                  <th className="py-3 px-4">Attendees</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <div>{s.subject_name || s.className}</div>
                      <div className="text-xs font-normal text-slate-400 dark:text-slate-500">{s.subject_code || s.code}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {s.class_name || s.className} • {s.section || 'Section A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {s.session_date || (s.starts_at ? new Date(s.starts_at).toLocaleDateString() : 'Today')}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(s.starts_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(s.expires_at || Date.now() + 15 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
                        <Users className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" /> {s.attendance_count !== undefined ? s.attendance_count : (s.totalAttended || 0)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/faculty/sessions/${s.id}`}
                          className="px-3 py-1.5 bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-sky-200 dark:border-sky-800"
                        >
                          <Eye className="w-3.5 h-3.5" /> Monitor
                        </Link>
                        {s.status === 'active' && (
                          <button
                            onClick={() => handleCloseSession(s.id)}
                            className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900 rounded-lg text-xs font-bold transition flex items-center gap-1 border border-rose-200 dark:border-rose-800"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Close
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

