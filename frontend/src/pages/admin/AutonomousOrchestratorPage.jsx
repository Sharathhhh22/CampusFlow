import React, { useState, useEffect } from 'react';
import { orchestratorApi } from '../../services/api';
import {
  Workflow,
  Cpu,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Users,
  Building,
  Bell,
  ArrowRight,
  Check,
  X,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const AutonomousOrchestratorPage = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [runningWorkflow, setRunningWorkflow] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const res = await orchestratorApi.listTasks();
      if (res.success && res.data) {
        setTasks(res.data);
        if (res.data.length > 0 && !selectedTask) {
          setSelectedTask(res.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerScenario = async (scenarioKey) => {
    try {
      setRunningWorkflow(true);
      const res = await orchestratorApi.runWorkflow(scenarioKey);
      if (res.success && res.data) {
        setToast({ msg: res.message, type: 'success' });
        await loadTasks();
        setSelectedTask(res.data);
      }
    } catch (err) {
      setToast({ msg: 'Failed to run orchestrator pipeline', type: 'error' });
    } finally {
      setRunningWorkflow(false);
      setTimeout(() => setToast(null), 3500);
    }
  };

  const handleApprove = async (taskId) => {
    try {
      const res = await orchestratorApi.approveTask(taskId, 'Approved by Institutional Administrator.');
      if (res.success) {
        setToast({ msg: res.message, type: 'success' });
        await loadTasks();
      }
    } catch (err) {
      setToast({ msg: 'Approval execution failed', type: 'error' });
    }
    setTimeout(() => setToast(null), 3500);
  };

  const handleReject = async (taskId) => {
    try {
      const res = await orchestratorApi.rejectTask(taskId, 'Action rejected by Dean. Class postponed.');
      if (res.success) {
        setToast({ msg: res.message, type: 'info' });
        await loadTasks();
      }
    } catch (err) {
      setToast({ msg: 'Rejection failed', type: 'error' });
    }
    setTimeout(() => setToast(null), 3500);
  };

  const agentsRoster = [
    { name: 'Student Support Agent', duty: 'Contextual student copilot & academic Q&A', status: 'Online' },
    { name: 'Attendance Intelligence Agent', duty: 'Calculates percentages & predicts 75% breaches', status: 'Online' },
    { name: 'Smart Timetable Agent', duty: 'Resolves faculty absences & room conflicts', status: 'Online' },
    { name: 'Campus Resource Agent', duty: 'Monitors classroom occupancy & HVAC/IoT grid', status: 'Online' },
    { name: 'Academic Recovery Agent', duty: 'Compiles custom study timelines for missing assignments', status: 'Online' },
    { name: 'Grievance Management Agent', duty: 'Auto-triages student complaints to departments', status: 'Online' },
    { name: 'AI Event Discovery Agent', duty: 'Recommends hackathons based on degree track', status: 'Online' },
    { name: 'Notification Agent', duty: 'Coordinates deduplicated multi-channel alerts', status: 'Online' }
  ];

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl font-medium text-sm text-white flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-900'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <Workflow className="w-4 h-4" />
            <span>Autonomous Multi-Agent Orchestrator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Swarm Coordination Engine & Human-in-the-Loop Queue
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Automates multi-agent operations across timetables, room allocation, attendance alerts, and governance audits.
          </p>
        </div>

        {/* Workflow Simulation Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTriggerScenario('faculty_absence')}
            disabled={runningWorkflow}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs text-white bg-purple-600 hover:bg-purple-500 shadow-sm transition-all"
          >
            <Play className={`w-3.5 h-3.5 ${runningWorkflow ? 'animate-spin' : ''}`} />
            <span>Simulate Faculty Absence Workflow</span>
          </button>
        </div>
      </div>

      {/* Agents Live Roster Matrix */}
      <div>
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Active Multi-Agent Swarm (8 Agents Online)
          </h2>
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Swarm Synchronized
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {agentsRoster.map((ag) => (
            <div key={ag.name} className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 truncate">{ag.name}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                  {ag.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{ag.duty}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Orchestrator Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Task List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Orchestrator Execution Pipeline ({tasks.length})
            </h2>
            <button
              onClick={loadTasks}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => {
              const isSelected = selectedTask?.id === task.id;
              const isPending = task.status === 'pending_approval';

              return (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-50/50 border-purple-300 ring-1 ring-purple-300 shadow-sm'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isPending ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {task.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{task.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.summary}</p>

                  <div className="mt-3 flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
                    {task.agents_involved?.map((ag, i) => (
                      <span key={i} className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {ag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Task Deep Trace & Approval Console */}
        <div className="lg:col-span-7">
          {selectedTask ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-purple-600">
                    {selectedTask.id}
                  </span>
                  <span className="text-xs text-slate-400">• Urgency: {selectedTask.urgency?.toUpperCase()}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{selectedTask.title}</h2>
                <p className="text-xs text-slate-500 mt-1 font-mono">Trigger: {selectedTask.trigger_event}</p>
              </div>

              {/* Proposed Automated Plan */}
              {selectedTask.proposed_action && (
                <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                      Recommended Autonomous Action
                    </span>
                    <span className="text-[11px] font-semibold text-purple-700">Ready for Execution</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-500">Course & Section</p>
                      <p className="font-semibold text-slate-900">{selectedTask.proposed_action.course}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Venue & Time</p>
                      <p className="font-semibold text-slate-900">{selectedTask.proposed_action.room} • {selectedTask.proposed_action.time}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Original Faculty</p>
                      <p className="font-semibold text-rose-600 line-through">{selectedTask.proposed_action.original_faculty}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Assigned Proxy Faculty</p>
                      <p className="font-semibold text-emerald-600">{selectedTask.proposed_action.proxy_faculty}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Multi-Step Agent Execution Pipeline Trace */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Agent Execution Pipeline Trace
                </h3>
                <div className="space-y-3">
                  {selectedTask.steps?.map((step, idx) => {
                    const isDone = step.status === 'completed';
                    const isWait = step.status === 'waiting_for_approval';

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                          isDone
                            ? 'bg-slate-50 border-slate-100'
                            : isWait
                            ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                            : 'bg-white border-slate-200/60 opacity-60'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px] ${
                          isDone ? 'bg-emerald-100 text-emerald-700' : isWait ? 'bg-amber-200 text-amber-800' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{step.agent}</span>
                            <span className="text-[10px] font-semibold uppercase">{step.status.replace(/_/g, ' ')}</span>
                          </div>
                          <p className="text-slate-600 mt-0.5">{step.action}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Human-in-the-Loop Authorization Controls */}
              {selectedTask.status === 'pending_approval' && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      Human Administrator Authorization Required
                    </h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Schedule changes & student broadcasts require explicit administrator sign-off.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReject(selectedTask.id)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(selectedTask.id)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-sm transition-all"
                    >
                      Approve & Execute Swarm
                    </button>
                  </div>
                </div>
              )}

              {/* Execution Audit Sign-off */}
              {selectedTask.admin_approval && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                  <p className="font-bold">Execution Audit Record</p>
                  <p>{selectedTask.admin_approval.approved_by || selectedTask.admin_approval.rejected_by} at {new Date(selectedTask.admin_approval.approved_at || selectedTask.admin_approval.rejected_at).toLocaleString()}</p>
                  <p className="italic text-emerald-800">"{selectedTask.admin_approval.comments || selectedTask.admin_approval.reason}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs">
              Select an orchestrator task from the pipeline to inspect execution traces.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
