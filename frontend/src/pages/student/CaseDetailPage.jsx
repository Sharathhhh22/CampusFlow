import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { caseApi } from '../../services/api';
import { StatusBadge, LoadingSpinner, ErrorState } from '../../components/common/FeedbackStates';
import {
  ArrowLeft,
  Clock,
  ShieldCheck,
  FileText,
  User,
  MessageSquare,
  AlertCircle,
  Send,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export const CaseDetailPage = () => {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [submittingInfo, setSubmittingInfo] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState(false);
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
      setError(err.message || 'Failed to retrieve verification case');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [id]);

  const handleAddInfoSubmit = async (e) => {
    e.preventDefault();
    if (!additionalInfo.trim()) return;

    setSubmittingInfo(true);
    setInfoSuccess(false);

    try {
      const res = await caseApi.addAdditionalInfo(id, {
        additional_information: additionalInfo
      });
      if (res.success) {
        setInfoSuccess(true);
        setAdditionalInfo('');
        fetchCase();
      }
    } catch (err) {
      alert(err.message || 'Error submitting additional info');
    } finally {
      setSubmittingInfo(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading case dossier..." />;
  if (error) return <ErrorState message={error} onRetry={fetchCase} />;
  if (!caseData) return <ErrorState title="Case Not Found" message="The requested case does not exist." />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button & Header */}
      <div>
        <Link
          to="/student/cases"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Recovery Cases
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-slate-400">CASE #{caseData.id}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 capitalize">
                {caseData.issue_category?.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {caseData.subject_name || 'Attendance Exception Report'}
            </h1>
          </div>
          <StatusBadge status={caseData.status} />
        </div>
      </div>

      {/* Case Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Subject & Section
          </span>
          <p className="text-sm font-bold text-slate-800">{caseData.subject_name || 'N/A'}</p>
          <p className="text-xs text-slate-500">{caseData.class_name} • {caseData.section}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Occurrence Time
          </span>
          <p className="text-sm font-bold text-slate-800">
            {new Date(caseData.reported_at || caseData.created_at).toLocaleDateString()}
          </p>
          <p className="text-xs text-slate-500">
            {new Date(caseData.reported_at || caseData.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Assigned Faculty
          </span>
          <p className="text-sm font-bold text-slate-800">{caseData.faculty_name || 'Faculty Member'}</p>
          <p className="text-xs text-slate-500">Authorized Human Reviewer</p>
        </div>
      </div>

      {/* Student Description Statement */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-sky-600" /> Student Statement (Self-Reported)
        </h3>
        <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
          "{caseData.description}"
        </p>
      </div>

      {/* Form: Awaiting Student Information */}
      {caseData.status === 'awaiting_student_info' && (
        <div className="bg-purple-50/70 border border-purple-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-purple-900">Faculty Requested Additional Information</h3>
              <p className="text-xs text-purple-700 mt-0.5">
                The reviewing faculty member needs clarifying context before making a decision.
              </p>
            </div>
          </div>

          {infoSuccess && (
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Additional details submitted! Case returned to faculty review queue.
            </div>
          )}

          <form onSubmit={handleAddInfoSubmit} className="space-y-3">
            <textarea
              required
              rows={3}
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Provide requested details (e.g. seated in row 3 with classmate Priya, phone battery died at 10:15 AM)..."
              className="w-full p-3 border border-purple-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            />
            <button
              type="submit"
              disabled={submittingInfo}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              {submittingInfo ? 'Sending...' : 'Submit Additional Details'}
            </button>
          </form>
        </div>
      )}

      {/* Evidence Timeline & System Findings */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-sky-600" /> Evidence Timeline & Verification Records
        </h3>

        {(!caseData.evidence || caseData.evidence.length === 0) ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            Evidence records are currently being indexed by the Evidence Agent.
          </p>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {caseData.evidence.map((ev) => (
              <div key={ev.id} className="relative">
                <div className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-xs ${
                  ev.verification_status === 'verified' ? 'bg-emerald-500' : 'bg-slate-400'
                }`} />
                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-800">{ev.evidence_type}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      ev.verification_status === 'verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {ev.verification_status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{ev.description}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">Source: {ev.source_type}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Faculty Decisions & Audit Log */}
      {caseData.decisions && caseData.decisions.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Official Faculty Verdict
          </h3>
          {caseData.decisions.map((d) => (
            <div key={d.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900">
                  Decision: <span className="capitalize">{d.decision.replace(/_/g, ' ')}</span>
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(d.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                <strong>Reason:</strong> {d.reason}
              </p>
              <p className="text-[11px] text-slate-400">
                Authorized Reviewer: {d.faculty_name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

