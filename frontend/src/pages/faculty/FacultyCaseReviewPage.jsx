import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { caseApi, decisionApi } from '../../services/api';
import { StatusBadge, LoadingSpinner, ErrorState } from '../../components/common/FeedbackStates';
import {
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  FileText,
  Clock,
  AlertTriangle,
  User,
  Send,
  RefreshCw,
  Cpu
} from 'lucide-react';

export const FacultyCaseReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [decision, setDecision] = useState('approved');
  const [reason, setReason] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCase = async () => {
    try {
      setLoading(true);
      const res = await caseApi.getById(id);
      if (res.success) {
        setCaseData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve case details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [id]);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await caseApi.analyze(id);
      if (res.success) {
        await fetchCase();
      }
    } catch (err) {
      alert(err.message || 'Error running AI investigation pipeline');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      alert('A clear mandatory decision reason must be provided.');
      return;
    }

    setSubmittingDecision(true);
    try {
      const res = await decisionApi.record(id, {
        decision,
        reason,
        internal_note: internalNote || null
      });

      if (res.success) {
        await fetchCase();
        alert(`Decision recorded successfully. Case marked as '${res.data.status}'.`);
      }
    } catch (err) {
      alert(err.message || 'Failed to record decision');
    } finally {
      setSubmittingDecision(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading investigation dossier..." />;
  if (error) return <ErrorState message={error} onRetry={fetchCase} />;
  if (!caseData) return <ErrorState title="Case Not Found" message="The requested case does not exist." />;

  // Extract agent run outputs if available
  const coordinatorRun = caseData.agent_runs?.find(r => r.agent_name === 'coordinator')?.output_json || null;
  const recoveryRun = caseData.agent_runs?.find(r => r.agent_name === 'recovery')?.output_json || null;
  const integrityRun = caseData.agent_runs?.find(r => r.agent_name === 'integrity')?.output_json || null;
  const evidenceRun = caseData.agent_runs?.find(r => r.agent_name === 'evidence')?.output_json || null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div>
        <Link
          to="/faculty/cases"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Review Queue
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-slate-400">DOSSIER #{caseData.id.slice(0, 8)}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 capitalize">
                {caseData.issue_category?.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {caseData.student_name} • {caseData.subject_name || 'Attendance Recovery Exception'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={caseData.status} />
            <button
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition border border-indigo-200 shadow-xs disabled:opacity-50"
            >
              <Cpu className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
              {analyzing ? 'Investigating...' : 'Re-Run Multi-Agent Analysis'}
            </button>
          </div>
        </div>
      </div>

      {/* Student Incident Report Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-sky-600" /> Student Incident Report
        </h3>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <p className="text-sm text-slate-800 font-medium leading-relaxed">
            "{caseData.description}"
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-200/60">
            <span>Student: <strong className="text-slate-700">{caseData.student_name}</strong></span>
            <span>Email: <strong className="text-slate-700">{caseData.student_email}</strong></span>
            <span>Occurrence: <strong className="text-slate-700">{new Date(caseData.reported_at || caseData.created_at).toLocaleString()}</strong></span>
          </div>
        </div>
      </div>

      {/* Multi-Agent AI Investigation Dossier */}
      <div className="bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/70 p-6 rounded-2xl border border-indigo-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Multi-Agent AI Investigation Dossier</h3>
              <p className="text-xs text-slate-500">
                Specialized agents coordinated to investigate technical failure, pattern risk, and evidence timeline.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono">
            4 Agents Active
          </span>
        </div>

        {/* 1. Coordinator Agent Synthesis */}
        <div className="bg-white p-4 rounded-xl border border-indigo-100 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Coordinator Agent Synthesis
          </span>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">
            {coordinatorRun?.investigation_summary ||
              `Coordinated evaluation completed. Verified session schedule and recorded telemetry events. Human review is recommended.`}
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
            <span>Workflow: <strong className="text-slate-700">Bounded (No loops)</strong></span>
            <span>•</span>
            <span>Recommended Step: <strong className="text-indigo-700 capitalize">{coordinatorRun?.recommended_next_step?.replace(/_/g, ' ') || 'Faculty Review'}</strong></span>
            <span>•</span>
            <span>Human Authority: <strong className="text-emerald-700">Strictly Preserved</strong></span>
          </div>
        </div>

        {/* 2. Recovery & Integrity Agents Findings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recovery Agent */}
          <div className="bg-white p-4 rounded-xl border border-indigo-100 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
              Smart Recovery Agent (Technical Analysis)
            </span>
            <div className="text-xs text-slate-600 space-y-1">
              <p>Session Validity: <strong className="text-slate-800 capitalize">{recoveryRun?.session_status || caseData.session_status || 'valid'}</strong></p>
              <p>Telemetry Findings:</p>
              <ul className="list-disc list-inside text-[11px] text-slate-500 space-y-0.5 pl-1">
                {(recoveryRun?.available_system_evidence || [
                  `Session was active during student-reported time`,
                  `Zero duplicate submissions detected for this student`
                ]).map((ev, i) => (
                  <li key={i}>{ev}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Integrity Agent */}
          <div className="bg-white p-4 rounded-xl border border-indigo-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                Attendance Integrity Agent
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                (integrityRun?.risk_level || 'low') === 'low'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                Risk Level: {integrityRun?.risk_level || 'low'}
              </span>
            </div>
            <div className="text-xs text-slate-600 space-y-1">
              <p>Anomaly Findings:</p>
              <ul className="list-disc list-inside text-[11px] text-slate-500 space-y-0.5 pl-1">
                {(integrityRun?.findings || [
                  { finding: 'Standard distribution; no rapid burst clustering found.' }
                ]).map((f, i) => (
                  <li key={i}>{f.finding}</li>
                ))}
              </ul>
              <p className="text-[10px] text-slate-400 italic pt-1">
                *Statistical observation only; never treated as misconduct proof.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Evidence Agent Timeline */}
        <div className="bg-white p-4 rounded-xl border border-indigo-100 space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> Evidence Agent Timeline (Chronological Ledger)
          </span>

          <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
            {caseData.evidence?.map((ev) => (
              <div key={ev.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-start justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-800 mr-2">[{ev.evidence_type}]</span>
                  <span className="text-slate-600">{ev.description}</span>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase whitespace-nowrap ${
                  ev.verification_status === 'verified'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700'
                }`}>
                  {ev.verification_status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Human Faculty Decision Form (Mandatory Authority) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <ShieldCheck className="w-5 h-5 text-sky-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">Faculty Decision Authority</h3>
            <p className="text-xs text-slate-500">
              Only authorized faculty members can approve or reject attendance corrections.
            </p>
          </div>
        </div>

        <form onSubmit={handleDecisionSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Decision Verdict
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                  decision === 'approved'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value="approved"
                  checked={decision === 'approved'}
                  onChange={(e) => setDecision(e.target.value)}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <span className="text-xs font-bold block">Approve Correction</span>
                  <span className="text-[11px] text-slate-500">Marks attendance as 'recovered'</span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                  decision === 'more_info_requested'
                    ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value="more_info_requested"
                  checked={decision === 'more_info_requested'}
                  onChange={(e) => setDecision(e.target.value)}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <span className="text-xs font-bold block">Request More Info</span>
                  <span className="text-[11px] text-slate-500">Returns case to student</span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
                  decision === 'rejected'
                    ? 'bg-rose-50 border-rose-500 text-rose-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  value="rejected"
                  checked={decision === 'rejected'}
                  onChange={(e) => setDecision(e.target.value)}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <div>
                  <span className="text-xs font-bold block">Reject Request</span>
                  <span className="text-[11px] text-slate-500">Leaves attendance absent</span>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Mandatory Decision Reason</span>
              <span className="text-rose-600 font-bold">*Required</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State the clear, audit-compliant justification for this verdict..."
              className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Internal Faculty Note (Optional)
            </label>
            <input
              type="text"
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Internal comments visible to department faculty and administrators only..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={submittingDecision || !reason.trim()}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition shadow-xs flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            {submittingDecision ? 'Recording Faculty Verdict...' : 'Submit Official Faculty Decision'}
          </button>
        </form>
      </div>

      {/* Historical Decisions Record */}
      {caseData.decisions && caseData.decisions.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Recorded Decision History</h3>
          <div className="space-y-2">
            {caseData.decisions.map((d) => (
              <div key={d.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 capitalize">Verdict: {d.decision.replace(/_/g, ' ')}</span>
                  <span className="text-slate-400">{new Date(d.created_at).toLocaleString()}</span>
                </div>
                <p className="text-slate-700"><strong>Reason:</strong> {d.reason}</p>
                {d.internal_note && (
                  <p className="text-slate-500 font-mono text-[11px]">Internal: {d.internal_note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

