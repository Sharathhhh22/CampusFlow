import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { caseApi } from '../../services/api';
import { StatusBadge, LoadingSpinner, ErrorState, EmptyState } from '../../components/common/FeedbackStates';
import { ClipboardList, Search, Filter, Sparkles, ArrowRight, User } from 'lucide-react';

export const FacultyCasesPage = () => {
  const [cases, setCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending_faculty_review');
  const [categoryFilter, setCategoryFilter] = useState('all');
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
        setError(err.message || 'Failed to retrieve cases');
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  if (loading) return <LoadingSpinner message="Loading faculty review queue..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const filtered = cases.filter(c => {
    const matchesSearch = c.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.subject_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || c.issue_category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Case Review Queue</h1>
          <p className="text-sm text-slate-500 mt-1">
            Review AI exception investigation dossiers, examine evidence, and authorize attendance corrections.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
          <ClipboardList className="w-4 h-4 text-amber-600" />
          <span>{filtered.length} In Current Queue</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by student name, subject, or description..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="pending_faculty_review">Pending Faculty Review</option>
            <option value="submitted">Submitted</option>
            <option value="under_investigation">Under AI Investigation</option>
            <option value="awaiting_student_info">Awaiting Student Info</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
          >
            <option value="all">All Categories</option>
            <option value="qr_scan_failure">QR Scan Failure</option>
            <option value="network_failure">Network Failure</option>
            <option value="app_error">Application Error</option>
            <option value="session_expiry">Session Expiry</option>
            <option value="attendance_not_appearing">Not Appearing in Ledger</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Cases Cards */}
      {filtered.length === 0 ? (
        <EmptyState
          title="Review Queue is Empty"
          message="No attendance recovery cases match your active filters."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-xs transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">{c.student_name}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-mono text-slate-400">ID: {c.student_id?.slice(0, 8)}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize">
                    {c.issue_category?.replace(/_/g, ' ')}
                  </span>
                </div>
                <StatusBadge status={c.status} />
              </div>

              <p className="text-sm font-semibold text-slate-800 mb-2">
                "{c.description}"
              </p>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span>Subject: <strong className="text-slate-700">{c.subject_name || 'Class Session'}</strong></span>
                  <span>•</span>
                  <span>Class: <strong className="text-slate-700">{c.class_name || 'CSE Section A'}</strong></span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-indigo-600 font-semibold">
                    <Sparkles className="w-3.5 h-3.5" /> {c.agent_runs_count || 1} Agent Runs
                  </span>
                </div>

                <Link
                  to={`/faculty/cases/${c.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Review Dossier & Decide <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

