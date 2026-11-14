import React, { useState, useEffect } from 'react';
import { attendanceApi, sessionApi } from '../../services/api';
import { StatusBadge, LoadingSpinner, ErrorState, EmptyState } from '../../components/common/FeedbackStates';
import { CalendarCheck, Search, Filter, Users, Download } from 'lucide-react';

export const ClassAttendancePage = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState('');
  const [records, setRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const res = await sessionApi.list();
        if (res.success && res.data.length > 0) {
          setSessions(res.data);
          setSelectedSessionId(res.data[0].id);
        }
      } catch (err) {
        setError(err.message || 'Error loading sessions');
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  useEffect(() => {
    if (!selectedSessionId) return;

    const fetchAttendees = async () => {
      try {
        setLoadingRecords(true);
        const res = await attendanceApi.getSessionAttendees(selectedSessionId);
        if (res.success) {
          setRecords(res.data || []);
        }
      } catch (e) {
        setRecords([]);
      } finally {
        setLoadingRecords(false);
      }
    };
    fetchAttendees();
  }, [selectedSessionId]);

  if (loading) return <LoadingSpinner message="Loading attendance records..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const filtered = records.filter(r =>
    r.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.student_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Class Attendance Records</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review verified student check-ins and recovered attendance records by session.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200">
          <Users className="w-4 h-4 text-sky-600" />
          <span>{filtered.length} Checked In</span>
        </div>
      </div>

      {/* Controls: Select Session & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="sm:w-1/2">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Select Class Session
          </label>
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.subject_name} ({s.subject_code}) • {s.session_date} ({s.status})
              </option>
            ))}
          </select>
        </div>

        <div className="sm:w-1/2">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Filter by Student Name
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search student name or email..."
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Attendees Table */}
      {loadingRecords ? (
        <LoadingSpinner message="Retrieving session attendees..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Check-in Records"
          message="No attendance submissions found for this session."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Recorded Timestamp</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 text-xs text-slate-400">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{r.student_name}</td>
                    <td className="py-3.5 px-4 text-slate-500">{r.student_email}</td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs font-mono">
                      {new Date(r.recorded_at).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={r.attendance_status} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400 font-mono">
                      {r.source}
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

