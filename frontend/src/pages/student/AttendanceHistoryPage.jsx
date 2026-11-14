import React, { useState, useEffect } from 'react';
import { attendanceApi } from '../../services/api';
import { StatusBadge, LoadingSpinner, ErrorState, EmptyState } from '../../components/common/FeedbackStates';
import { CalendarCheck, Search, Filter, ShieldCheck, Download } from 'lucide-react';

export const AttendanceHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await attendanceApi.getHistory();
        if (res.success) {
          setHistory(res.data || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch attendance history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) return <LoadingSpinner message="Retrieving your attendance ledger..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const filtered = history.filter(item => {
    const matchesSearch = item.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.subject_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.class_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.attendance_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Attendance Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete record of your verified check-ins and faculty-approved recoveries.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-sky-600" />
          <span>{filtered.length} Total Records</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by subject name or code..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="present">Present (QR Scan)</option>
            <option value="recovered">Recovered (Faculty Approval)</option>
          </select>
        </div>
      </div>

      {/* Attendance Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No Attendance Records Found"
          message="No records match your selected search or filter criteria."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Class & Section</th>
                  <th className="py-3 px-4">Session Date</th>
                  <th className="py-3 px-4">Recorded Timestamp</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{r.subject_name}</div>
                      <div className="text-xs font-normal text-slate-400">{r.subject_code}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {r.class_name} • {r.section}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {r.session_date}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {new Date(r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={r.attendance_status} />
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
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

