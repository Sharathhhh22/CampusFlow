import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { grievanceApi } from '../../services/api';
import {
  LifeBuoy,
  Plus,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  Check,
  Tag
} from 'lucide-react';

export const GrievancePortalPage = () => {
  const { user } = useAuth();
  const [grievances, setGrievances] = useState([]);
  const [selectedGrievance, setSelectedGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    category: 'infrastructure',
    title: '',
    description: '',
    urgency: 'medium'
  });

  useEffect(() => {
    loadGrievances();
  }, []);

  const loadGrievances = async () => {
    try {
      setLoading(true);
      const res = await grievanceApi.list();
      if (res.success && res.data) {
        setGrievances(res.data);
        if (res.data.length > 0 && !selectedGrievance) {
          setSelectedGrievance(res.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    try {
      const res = await grievanceApi.submit(formData);
      if (res.success) {
        setToast({ msg: res.message, type: 'success' });
        setShowSubmitModal(false);
        setFormData({ category: 'infrastructure', title: '', description: '', urgency: 'medium' });
        loadGrievances();
      }
    } catch (err) {
      setToast({ msg: 'Failed to lodge grievance', type: 'error' });
    }
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl font-medium text-sm text-white flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-xs tracking-wider uppercase mb-1">
            <LifeBuoy className="w-4 h-4" />
            <span>Autonomous Grievance Agent</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Institutional Grievance & SLA Resolution Portal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Student complaint routing engine with autonomous triage, department escalation, and guaranteed resolution tracking.
          </p>
        </div>
        <button
          onClick={() => setShowSubmitModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-rose-600 hover:bg-rose-500 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Lodge Grievance</span>
        </button>
      </div>

      {/* Two-Column Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Grievance Ticket Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              My Active Tickets ({grievances.length})
            </h2>
            <span className="text-xs text-slate-400 dark:text-slate-500">Strict SLA Tracking</span>
          </div>

          <div className="space-y-3">
            {grievances.map((g) => {
              const isSelected = selectedGrievance?.id === g.id;

              return (
                <div
                  key={g.id}
                  onClick={() => setSelectedGrievance(g)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700 ring-1 ring-rose-300 dark:ring-rose-700 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {g.ticket_number}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      g.status === 'resolved'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : g.status === 'in_progress'
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                    }`}>
                      {g.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{g.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{g.description}</p>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>{g.department_assigned}</span>
                    <span>SLA: {g.sla_hours}h</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Grievance Lifecycle Detail */}
        <div className="lg:col-span-7">
          {selectedGrievance ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-6">
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
                    {selectedGrievance.ticket_number}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">• Lodged by {selectedGrievance.student_name}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedGrievance.title}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Assigned Authority: <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedGrievance.department_assigned}</span>
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">
                  Complaint Description
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  {selectedGrievance.description}
                </p>
              </div>

              {/* AI Grievance Agent Dossier */}
              <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 space-y-2">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  <span>AI Grievance Agent Automated Routing Analysis</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  Severity evaluated as <strong className="uppercase">{selectedGrievance.urgency}</strong>. Escalation threshold set to <strong>{selectedGrievance.sla_hours} hours</strong> before notification alerts the Dean of Campus Facilities.
                </p>
              </div>

              {/* Status Timeline */}
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Resolution Trajectory
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">Grievance Submitted & Verified</p>
                      <p className="text-slate-400 dark:text-slate-500 text-[11px]">{new Date(selectedGrievance.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0 mt-0.5 font-bold">2</div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">AI Department Routing</p>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px]">Auto-assigned to {selectedGrievance.department_assigned}</p>
                    </div>
                  </div>
                  {selectedGrievance.resolution_notes && (
                    <div className="flex items-start gap-3 text-xs">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 mt-0.5 font-bold">3</div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Officer Action Log</p>
                        <p className="text-indigo-900 dark:text-indigo-300 font-medium text-[11px]">{selectedGrievance.resolution_notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
              Select a ticket to review resolution history.
            </div>
          )}
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Submit Institutional Grievance</h2>
              <button onClick={() => setShowSubmitModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  <option value="infrastructure">Infrastructure & Classroom Glitch</option>
                  <option value="academic">Academic & Curriculum Query</option>
                  <option value="examination">Examination & Seating Dispute</option>
                  <option value="hostel_mess">Hostel, Mess & Dining Facilities</option>
                  <option value="it_network">Campus Wi-Fi & IT Lab Connectivity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Subject / Summary *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Broken projector connection in Hall B-204"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Detailed Explanation *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="Provide detailed context, dates, location, and previous actions taken..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-sm"
                >
                  Submit Grievance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
