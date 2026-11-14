import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { caseApi } from '../../services/api';
import { StatusBadge, LoadingSpinner, ErrorState } from '../../components/common/FeedbackStates';
import { ClipboardList, Search, ArrowRight, Sparkles } from 'lucide-react';

export const AdminCasesPage = () => {
  const [cases, setCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const res = await caseApi.list();
        if (res.success) setCases(res.data || []);
      } catch (err) {
        setError(err.message || 'Failed to retrieve cases');
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  if (loading) return <LoadingSpinner message="Retrieving institutional recovery cases..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const filtered = cases.filter(c =>
    c.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.issue_category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Recovery Cases</h1>
          <p className="text-sm text-slate-500 mt-1">
            Global view of all student-reported attendance exceptions and AI coordinator pipelines.
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by student, category, or description..."
          className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-slate-900 text-sm">{c.student_name}</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 capitalize">{c.issue_category?.replace(/_/g, ' ')}</span>
                <span className="text-slate-300">•</span>
                <span className="text-[11px] text-slate-400 font-mono">Case #{c.id.slice(0, 8)}</span>
              </div>
              <p className="text-xs text-slate-600 line-clamp-1 italic">"{c.description}"</p>
            </div>

            <div className="flex items-center gap-3">
              <StatusBadge status={c.status} />
              <Link
                to={`/faculty/cases/${c.id}`}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs"
              >
                Inspect <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

