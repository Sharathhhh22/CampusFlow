import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { caseApi } from '../../services/api';
import { StatusBadge, LoadingSpinner, ErrorState, EmptyState } from '../../components/common/FeedbackStates';
import { ClipboardList, Plus, Search, Filter, ArrowRight, Clock } from 'lucide-react';

export const CasesListPage = () => {
  const [cases, setCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const res = await caseApi.list();
        if (res.success) {
          setCases(res.data || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve recovery cases');
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  if (loading) return <LoadingSpinner message="Loading your attendance recovery cases..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const filtered = cases.filter(c => {
    const matchesSearch = c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.issue_category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.subject_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Recovery Cases</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track the investigation progress and faculty decisions on your reported attendance exceptions.
          </p>
        </div>
        <Link
          to="/student/report-issue"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-sky-200 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Report New Issue
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cases by description, subject, or category..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
          >
            <option value="all">All Case Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="under_investigation">Under Investigation</option>
            <option value="awaiting_student_info">Awaiting Student Info</option>
            <option value="pending_faculty_review">Pending Faculty Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Cases List */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No Recovery Cases Found"
          message="You have not submitted any attendance recovery requests matching this filter."
          action={
            <Link
              to="/student/report-issue"
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 transition"
            >
              Report an Attendance Issue
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((c) => (
            <Link
              key={c.id}
              to={`/student/cases/${c.id}`}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-sm transition block group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Case #{c.id.slice(0, 8)}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 capitalize">
                    {c.issue_category?.replace(/_/g, ' ')}
                  </span>
                </div>
                <StatusBadge status={c.status} />
              </div>

              <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-600 transition mb-2">
                {c.description}
              </h3>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-3">
                  <span>Subject: <strong className="text-slate-700">{c.subject_name || 'General Course Session'}</strong></span>
                  <span>•</span>
                  <span>Reported: {new Date(c.reported_at || c.created_at).toLocaleDateString()}</span>
                </div>
                <div className="text-sky-600 font-semibold flex items-center gap-1">
                  View Timeline & Investigation <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

