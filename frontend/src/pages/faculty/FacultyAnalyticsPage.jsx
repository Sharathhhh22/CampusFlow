import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../../services/api';
import { LoadingSpinner, ErrorState } from '../../components/common/FeedbackStates';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const FacultyAnalyticsPage = () => {
  const [summary, setSummary] = useState(null);
  const [issues, setIssues] = useState([]);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [sumRes, issuesRes, trendsRes] = await Promise.all([
          analyticsApi.getSummary(),
          analyticsApi.getIssues(),
          analyticsApi.getRecovery()
        ]);

        if (sumRes.success) setSummary(sumRes.data);
        if (issuesRes.success) setIssues(issuesRes.data || []);
        if (trendsRes.success) setTrends(trendsRes.data || []);
      } catch (err) {
        setError(err.message || 'Failed to retrieve analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingSpinner message="Generating real-time analytics graphs..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const formattedIssues = issues.map(i => ({
    name: i.category.replace(/_/g, ' '),
    count: i.count
  }));

  const resolutionRate = summary?.resolved_cases + summary?.requiring_faculty_review > 0
    ? Math.round((summary.resolved_cases / (summary.resolved_cases + summary.requiring_faculty_review)) * 100)
    : 100;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Attendance Exception Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">
          Real-time metrics on attendance failure patterns, AI investigations, and faculty resolution throughput.
        </p>
      </div>

      {/* Top Stat Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Resolution Rate</span>
          <div className="text-3xl font-black text-slate-900 mt-2">{resolutionRate}%</div>
          <p className="text-xs text-slate-500 mt-1">{summary?.resolved_cases || 0} resolved of total filed cases</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Awaiting Action</span>
          <div className="text-3xl font-black text-amber-600 mt-2">{summary?.requiring_faculty_review || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Cases in faculty review queue</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total AI Investigations</span>
          <div className="text-3xl font-black text-indigo-600 mt-2">{summary?.total_agent_investigations || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Agent runs logged to database</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Issues by Category */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Attendance Issues by Category</h3>
            <span className="text-xs font-mono text-slate-400">Real-time DB query</span>
          </div>
          {formattedIssues.length === 0 ? (
            <p className="text-xs text-slate-400 py-16 text-center">No issue records found</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedIssues} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" angle={-15} textAnchor="end" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Daily Recovery Trends */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">14-Day Case Resolution Trends</h3>
            <span className="text-xs font-mono text-slate-400">Daily throughput</span>
          </div>
          {trends.length === 0 ? (
            <p className="text-xs text-slate-400 py-16 text-center">No trend activity yet</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="total_cases" stroke="#64748b" name="Total Filed" strokeWidth={2} />
                  <Line type="monotone" dataKey="approved_cases" stroke="#10b981" name="Approved" strokeWidth={2} />
                  <Line type="monotone" dataKey="rejected_cases" stroke="#ef4444" name="Rejected" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

