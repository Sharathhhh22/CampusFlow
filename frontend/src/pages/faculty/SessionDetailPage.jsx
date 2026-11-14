import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { sessionApi, attendanceApi } from '../../services/api';
import { StatusBadge, LoadingSpinner, ErrorState } from '../../components/common/FeedbackStates';
import {
  ArrowLeft,
  Users,
  Clock,
  QrCode,
  XCircle,
  Copy,
  CheckCircle2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

export const SessionDetailPage = () => {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [qrPayload, setQrPayload] = useState('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSessionData = async () => {
    try {
      setLoading(true);
      const [sessRes, attRes] = await Promise.all([
        sessionApi.getById(id),
        attendanceApi.getSessionAttendees(id)
      ]);

      if (sessRes.success) {
        setSession(sessRes.data);
        const payload = JSON.stringify({
          app: 'CampusFlow',
          session_id: sessRes.data.id,
          token: sessRes.data.token || sessRes.data.token_hash,
          expires_at: sessRes.data.expires_at
        });
        setQrPayload(payload);
      }
      if (attRes.success) {
        setAttendees(attRes.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve session details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionData();
  }, [id]);

  // Live Countdown Timer
  useEffect(() => {
    if (!session || session.status !== 'active') return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(session.expires_at).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        setSession(prev => ({ ...prev, status: 'expired' }));
        clearInterval(interval);
      } else {
        const mins = Math.floor(diff / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${mins}m ${secs < 10 ? '0' : ''}${secs}s remaining`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  const handleClose = async () => {
    if (!window.confirm('Close this attendance session immediately?')) return;
    try {
      const res = await sessionApi.close(id);
      if (res.success) {
        setSession(res.data);
        setTimeLeft('Closed');
      }
    } catch (err) {
      alert(err.message || 'Error closing session');
    }
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(qrPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <LoadingSpinner message="Loading live attendance monitor..." />;
  if (error) return <ErrorState message={error} onRetry={fetchSessionData} />;
  if (!session) return <ErrorState title="Session Not Found" message="The requested session does not exist." />;

  const isExpiredOrClosed = session.status !== 'active' || timeLeft === 'Expired';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <Link
          to="/faculty/sessions"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sessions
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-slate-400">SESSION #{session.id.slice(0, 8)}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">{session.class_name} • {session.section}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {session.subject_name} ({session.subject_code})
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={session.status} />
            {session.status === 'active' && (
              <button
                onClick={handleClose}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition border border-rose-200"
              >
                <XCircle className="w-4 h-4" /> End Session Now
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: QR Code Projection Card */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-sky-600" /> Live QR Projection
            </span>
            <span className={`text-xs font-bold ${isExpiredOrClosed ? 'text-rose-600' : 'text-emerald-600'}`}>
              {isExpiredOrClosed ? 'Inactive' : timeLeft || 'Valid'}
            </span>
          </div>

          <div className="p-4 bg-white border-2 border-slate-100 rounded-2xl shadow-sm my-2">
            {qrPayload ? (
              <QRCodeSVG
                value={qrPayload}
                size={240}
                level="M"
                includeMargin={true}
                className={isExpiredOrClosed ? 'opacity-20 grayscale' : ''}
              />
            ) : (
              <div className="w-60 h-60 bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
                Generating QR...
              </div>
            )}
          </div>

          {isExpiredOrClosed ? (
            <p className="text-xs font-bold text-rose-600 mt-3 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> This attendance session has ended.
            </p>
          ) : (
            <p className="text-xs text-slate-500 mt-3 max-w-xs">
              Project this screen in your lecture hall. Tokens automatically invalidate upon duration expiration.
            </p>
          )}

          {/* Quick Evaluator Copy Button */}
          <div className="w-full mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={handleCopyPayload}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition flex items-center justify-center gap-2"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-400" />}
              {copied ? 'QR Payload Copied to Clipboard!' : 'Copy QR Payload / Token (For Testing)'}
            </button>
          </div>
        </div>

        {/* Right Column: Live Attendees List */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Verified Attendees ({attendees.length})
              </h3>
            </div>
            <button
              onClick={fetchSessionData}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
              title="Refresh Roster"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {attendees.length === 0 ? (
            <div className="p-12 text-center text-slate-400 my-auto text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              Waiting for students to scan and check-in...
            </div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto max-h-[420px] pr-1">
              {attendees.map((a, idx) => (
                <div
                  key={a.id}
                  className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">{a.student_name}</p>
                      <p className="text-[11px] text-slate-400">{a.student_email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={a.attendance_status} />
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      {new Date(a.recorded_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

