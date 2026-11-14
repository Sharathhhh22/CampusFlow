import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { attendanceApi, sessionApi, classApi } from '../../services/api';
import { LifeBuoy, AlertCircle, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ReportIssuePage = () => {
  const [searchParams] = useSearchParams();
  const prefilledSessionId = searchParams.get('sessionId') || '';

  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState(prefilledSessionId);
  const [issueCategory, setIssueCategory] = useState('qr_scan_failure');
  const [description, setDescription] = useState('');
  const [occurredAt, setOccurredAt] = useState(new Date().toISOString().slice(0, 16));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentSessions = async () => {
      try {
        const res = await sessionApi.list();
        if (res.success) {
          setSessions(res.data || []);
          if (!sessionId && res.data.length > 0) {
            setSessionId(res.data[0].id);
          }
        }
      } catch (e) {
        // quiet error
      }
    };
    fetchRecentSessions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await attendanceApi.reportIssue({
        session_id: sessionId || null,
        issue_category: issueCategory,
        description: description,
        occurred_at: new Date(occurredAt).toISOString()
      });

      if (res.success && res.data) {
        navigate(`/student/cases/${res.data.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit attendance recovery request.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'qr_scan_failure', label: 'QR Scan Failure (Camera/Focus/Lens Error)' },
    { value: 'network_failure', label: 'Network Disruption (Wi-Fi/Cellular Drop)' },
    { value: 'app_error', label: 'Application or Browser Crash' },
    { value: 'session_expiry', label: 'Session Expired Abruptly During Check-in' },
    { value: 'attendance_not_appearing', label: 'Scanned Successfully but Not Appearing in Ledger' },
    { value: 'other', label: 'Other Technical Exception' }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Report Attendance Issue</h1>
        <p className="text-sm text-slate-500 mt-1">
          Submit an evidence-backed attendance recovery request for review by your faculty.
        </p>
      </div>

      {/* Trust & Verification Notice */}
      <div className="p-4 bg-sky-50 border border-sky-200/80 rounded-2xl text-xs text-sky-800 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-sky-900">
          <ShieldAlert className="w-4 h-4 text-sky-600 flex-shrink-0" />
          Transparency & Verification Policy
        </div>
        <p className="text-sky-700/90 leading-relaxed">
          Reported issues are investigated by CampusFlow's Multi-Agent AI system and forwarded to the assigned faculty member. External or self-reported claims remain strictly <span className="font-semibold underline">unverified</span> until authorized human review is completed.
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Associated Class Session
            </label>
            <select
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="">-- General / External College Attendance Issue --</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.subject_name} ({s.subject_code}) • {s.session_date} ({s.status})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Select the session you experienced issues with, or choose General if reporting an external college scan failure.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Issue Category
            </label>
            <select
              required
              value={issueCategory}
              onChange={(e) => setIssueCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              {categories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Approximate Occurrence Time
            </label>
            <input
              type="datetime-local"
              required
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Detailed Description of the Issue
            </label>
            <textarea
              required
              rows={4}
              minLength={10}
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what occurred (e.g. Device disconnected from Room 402 Wi-Fi while submitting attendance QR at 10:14 AM)..."
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Minimum 10 characters</span>
              <span>{description.length}/1000 characters</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-sky-200 flex items-center justify-center gap-2"
          >
            {loading ? 'Submitting Recovery Case...' : 'Submit Case for Multi-Agent Investigation'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

