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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { BarChart3, TrendingUp, Users, ShieldCheck } from 'lucide-react';

export const AdminAnalyticsPage = () => {
  const [summary, setSummary] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [sumRes, issuesRes] = await Promise.all([
          analyticsApi.getSummary(),
          analyticsApi.getIssues()
        ]);

        if (sumRes.success) setSummary(sumRes.data);
        if (issuesRes.success) setIssues(issuesRes.data || []);
      } catch (err) {
        setError(err.message || 'Failed to retrieve analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <LoadingSpinner message="Calculating institutional metrics..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const COLORS = ['#0284c7', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

  const formattedIssues = issues.map((item, idx) => ({
    name: item.category.replace(/_/g, ' '),
    value: item.count,
    color: COLORS[idx % COLORS.length]
  }));

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">
          High-level metrics on attendance reliability, system exception frequency, and agent resolution throughput.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Issues Distribution</h3>
          {formattedIssues.length === 0 ? (
            <p className="text-xs text-slate-400 py-16 text-center">No issues data available</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedIssues}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {formattedIssues.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Platform Reliability Summary</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <span className="text-slate-600">Total Valid Demo Check-ins:</span>
              <strong className="text-slate-900 font-bold text-sm">{summary?.valid_submissions || 0}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <span className="text-slate-600">Pending Exception Cases:</span>
              <strong className="text-amber-600 font-bold text-sm">{summary?.pending_recovery_requests || 0}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <span className="text-slate-600">Cases Under Faculty Review:</span>
              <strong className="text-purple-600 font-bold text-sm">{summary?.requiring_faculty_review || 0}</strong>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <span className="text-slate-600">Total Agent Investigations:</span>
              <strong className="text-indigo-600 font-bold text-sm">{summary?.total_agent_investigations || 0}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

