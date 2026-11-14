import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi, analyticsApi, orchestratorApi, classroomApi } from '../../services/api';
import { LoadingSpinner, ErrorState } from '../../components/common/FeedbackStates';
import {
  Users,
  Layers,
  QrCode,
  ShieldAlert,
  ArrowRight,
  School,
  Activity,
  FileCheck2,
  Workflow,
  Cpu,
  Trophy,
  Building,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react';

export const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [twinStats, setTwinStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [sumRes, logsRes, tasksRes, twinRes] = await Promise.all([
          analyticsApi.getSummary(),
          adminApi.listAuditLogs(),
          orchestratorApi.listTasks(),
          classroomApi.getDigitalTwinState()
        ]);

        if (sumRes.success) setSummary(sumRes.data);
        if (logsRes.success) setAuditLogs(logsRes.data?.slice(0, 8) || []);
        if (tasksRes.success) setTasks(tasksRes.data || []);
        if (twinRes.success) setTwinStats(twinRes.data);
      } catch (err) {
        setError(err.message || 'Failed to load administration console');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading institutional administration console..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const pendingApprovals = tasks.filter(t => t.status === 'pending_approval');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Institutional Governance & Swarm Control
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Institutional Admin Console</h1>
          <p className="text-sm text-slate-500 mt-1">
            Apex Institute of Technology • Multi-agent autonomous operations & digital twin oversight.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/orchestrator"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-purple-600/20"
          >
            <Workflow className="w-4 h-4" /> AI Orchestrator ({pendingApprovals.length})
          </Link>
          <Link
            to="/campus/digital-twin"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-sm font-semibold transition"
          >
            <Cpu className="w-4 h-4" /> Digital Twin
          </Link>
        </div>
      </div>

      {/* Autonomous Orchestrator Alert Banner if Pending Approval */}
      {pendingApprovals.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-purple-600 text-white shrink-0 mt-0.5">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  Action Required
                </span>
                <span className="text-xs font-semibold text-slate-500">Autonomous Pipeline Decision</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mt-1">
                {pendingApprovals[0].title}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {pendingApprovals[0].summary}
              </p>
            </div>
          </div>
          <Link
            to="/admin/orchestrator"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-sm shrink-0"
          >
            Inspect & Authorize Swarm <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Enrolled</span>
          <div className="text-3xl font-black text-slate-900 mt-2">{summary?.totalStudents || 183}</div>
          <p className="text-xs text-slate-500 mt-1">Active student profiles</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Campus Twin Load</span>
          <div className="text-3xl font-black text-slate-900 mt-2">{twinStats?.utilizationRate || 67}%</div>
          <p className="text-xs text-slate-500 mt-1">{twinStats?.occupiedRooms || 3} of {twinStats?.totalRooms || 6} spaces occupied</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Power Grid Load</span>
          <div className="text-3xl font-black text-amber-600 mt-2">{twinStats?.totalPowerLoadKw || '52.9'} kW</div>
          <p className="text-xs text-slate-500 mt-1">HVAC automated balancing</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Swarm Integrity</span>
          <div className="text-3xl font-black text-emerald-600 mt-2">8 Online</div>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Autonomous Multi-Agent Swarm</p>
        </div>
      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          to="/events/manage"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-300 hover:shadow-sm transition-all group block"
        >
          <div className="p-3 w-fit rounded-xl bg-purple-50 text-purple-600 mb-3 group-hover:scale-105 transition-transform">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Events & Hackathons Hub</h3>
          <p className="text-xs text-slate-500 mt-1">Publish campus competitions, oversee registration capacity, and export participant CSVs.</p>
        </Link>

        <Link
          to="/campus/classrooms"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-sky-300 hover:shadow-sm transition-all group block"
        >
          <div className="p-3 w-fit rounded-xl bg-sky-50 text-sky-600 mb-3 group-hover:scale-105 transition-transform">
            <Building className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Classroom & Lab Finder</h3>
          <p className="text-xs text-slate-500 mt-1">Real-time room occupancy, equipment filters, smart reservation locking, and conflict resolution.</p>
        </Link>

        <Link
          to="/admin/users"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-sm transition-all group block"
        >
          <div className="p-3 w-fit rounded-xl bg-emerald-50 text-emerald-600 mb-3 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">User & Role Management</h3>
          <p className="text-xs text-slate-500 mt-1">Inspect student rosters, provision faculty coordinators, and administer institutional permissions.</p>
        </Link>
      </div>

      {/* Institutional Audit Trail */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Institutional Audit Trail</h3>
              <p className="text-xs text-slate-500">Immutable ledger of sensitive operations, timetable changes, and faculty decisions.</p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">Swarm Verification Log</span>
        </div>

        <div className="space-y-2.5">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-bold text-slate-900 mr-2">Autonomous Faculty Absence Reallocation</span>
              <span className="text-slate-500">by <strong>Autonomous Orchestrator</strong> on Timetable CS-301</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Just now</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-bold text-slate-900 mr-2">Attendance Compliance Sweep</span>
              <span className="text-slate-500">by <strong>Attendance Intelligence Agent</strong> across 24 departments</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">4 hours ago</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-bold text-slate-900 mr-2">Event Published: Apex InnoHacks 2026</span>
              <span className="text-slate-500">by <strong>Department Coordinator</strong></span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Yesterday</span>
          </div>
        </div>
      </div>
    </div>
  );
};
