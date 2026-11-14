import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sessionApi } from '../../services/api';
import { StatusBadge, LoadingSpinner, ErrorState } from '../../components/common/FeedbackStates';
import { QrCode, Search, Users, Eye } from 'lucide-react';

export const AdminSessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const res = await sessionApi.list();
        if (res.success) setSessions(res.data || []);
      } catch (err) {
        setError(err.message || 'Failed to retrieve sessions');
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  if (loading) return <LoadingSpinner message="Retrieving institutional sessions..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const filtered = sessions.filter(s =>
    s.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.class_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.faculty_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Attendance Sessions</h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit and inspect all QR check-in sessions generated across the institution.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by subject, class, or faculty name..."
          className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Subject</th>
              <th className="py-3 px-4">Class</th>
              <th className="py-3 px-4">Faculty</th>
              <th className="py-3 px-4">Date & Time</th>
              <th className="py-3 px-4">Check-ins</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filtered.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/70 transition">
                <td className="py-3.5 px-4 font-bold text-slate-900">{s.subject_name}</td>
                <td className="py-3.5 px-4 text-slate-700">{s.class_name} ({s.section})</td>
                <td className="py-3.5 px-4 text-slate-700">{s.faculty_name}</td>
                <td className="py-3.5 px-4 text-xs text-slate-500">
                  {s.session_date} • {new Date(s.starts_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-800">{s.attendance_count}</td>
                <td className="py-3.5 px-4"><StatusBadge status={s.status} /></td>
                <td className="py-3.5 px-4 text-right">
                  <Link
                    to={`/faculty/sessions/${s.id}`}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition inline-flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

