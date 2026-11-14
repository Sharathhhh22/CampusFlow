import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { attendanceApi, sessionApi } from '../../services/api';
import { StatusBadge } from '../../components/common/FeedbackStates';
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  LifeBuoy,
  RefreshCw,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const QRScanPage = () => {
  const [activeSessions, setActiveSessions] = useState([]);
  const [manualSessionId, setManualSessionId] = useState('ses-102');
  const [manualToken, setManualToken] = useState('ACTIVE_TOKEN_CS301');
  const [submitting, setSubmitting] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  const scannerRef = useRef(null);
  const navigate = useNavigate();

  // Load active sessions for quick demo testing
  useEffect(() => {
    const fetchActiveSessions = async () => {
      try {
        const res = await sessionApi.list({ status: 'active' });
        if (res.success && res.data && res.data.length > 0) {
          setActiveSessions(res.data);
          const active = res.data.find(s => s.status === 'active') || res.data[0];
          setManualSessionId(active.id);
          setManualToken(active.rawToken || active.token || active.tokenHash || active.token_hash || 'ACTIVE_TOKEN_CS301');
        } else {
          setManualSessionId('ses-102');
          setManualToken('ACTIVE_TOKEN_CS301');
        }
      } catch (e) {
        setManualSessionId('ses-102');
        setManualToken('ACTIVE_TOKEN_CS301');
      }
    };
    fetchActiveSessions();
  }, []);

  // Initialize Camera Scanner
  useEffect(() => {
    if (!cameraActive) return;

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      false
    );

    scanner.render(
      async (decodedText) => {
        try {
          scanner.clear();
          setCameraActive(false);

          let sessionId = '';
          let token = '';

          try {
            const parsed = JSON.parse(decodedText);
            sessionId = parsed.session_id || parsed.id;
            token = parsed.token;
          } catch (e) {
            token = decodedText;
            sessionId = manualSessionId || 'ses-102';
          }

          if (!sessionId) {
            sessionId = manualSessionId || 'ses-102';
          }

          await submitCheckIn(sessionId, token);
        } catch (err) {
          setScanError(err.message || 'Error processing QR code');
        }
      },
      (error) => {
        // quiet scanning errors
      }
    );

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [cameraActive, manualSessionId]);

  const submitCheckIn = async (sessionId, token) => {
    setSubmitting(true);
    setScanResult(null);
    setScanError(null);

    try {
      const res = await attendanceApi.scan({
        session_id: sessionId,
        token: token,
        device_info: navigator.userAgent
      });

      if (res.success) {
        setScanResult(res.data);
      } else {
        setScanError(res.message || 'Verification could not be completed.');
      }
    } catch (err) {
      setScanError(err.response?.data?.message || err.message || 'Failed to record check-in.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualSessionId || !manualToken) {
      setScanError('Please enter both session ID and token.');
      return;
    }
    submitCheckIn(manualSessionId, manualToken);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">QR Attendance Check-in</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Scan the faculty-displayed CampusFlow QR code or use the demo test panel below.
        </p>
      </div>

      {/* Success Banner */}
      {scanResult && (
        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-3 transition-colors">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">Attendance Recorded Successfully!</h3>
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            Recorded status: <span className="font-semibold uppercase">{scanResult.attendance_status || scanResult.status || 'PRESENT'}</span> • Server timestamp: {scanResult.recorded_at ? new Date(scanResult.recorded_at).toLocaleTimeString() : new Date().toLocaleTimeString()}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/student/attendance"
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
            >
              View in Attendance Ledger
            </Link>
            <button
              onClick={() => { setScanResult(null); setScanError(null); }}
              className="px-4 py-2 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-slate-800 transition"
            >
              Scan Another Session
            </button>
          </div>
        </div>
      )}

      {/* Failure / Error Banner */}
      {scanError && (
        <div className="p-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl space-y-3 transition-colors">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">Attendance Verification Failed</h3>
              <p className="text-xs text-rose-700 dark:text-rose-400 mt-1">{scanError}</p>
            </div>
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-rose-200/60 dark:border-rose-900/60">
            <span className="text-xs text-slate-500 dark:text-slate-400">Experienced a network error or scan timeout?</span>
            <Link
              to={`/student/report-issue?sessionId=${manualSessionId}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
            >
              <LifeBuoy className="w-3.5 h-3.5" /> File Recovery Report
            </Link>
          </div>
        </div>
      )}

      {/* Camera Scanner View */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs text-center transition-colors">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Camera Scanner</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 max-w-sm mx-auto">
          Position your device camera towards the faculty session QR screen.
        </p>

        {cameraActive ? (
          <div>
            <div id="qr-reader" className="mx-auto max-w-md rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700" />
            <button
              onClick={() => setCameraActive(false)}
              className="mt-4 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition"
            >
              Stop Camera
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCameraActive(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-sky-200 dark:shadow-none"
          >
            <QrCode className="w-4 h-4" /> Start Device Camera Scanner
          </button>
        )}
      </div>

      {/* Demo Manual Check-in Simulator */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> Demo Check-in Simulator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Allows evaluators to test attendance submission without a second physical device.
            </p>
          </div>
          {activeSessions.length > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              {activeSessions.length} Active Session(s)
            </span>
          )}
        </div>

        {activeSessions.length > 0 && (
          <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block mb-2">
              Select Active Session to Test:
            </span>
            <div className="space-y-1.5">
              {activeSessions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setManualSessionId(s.id);
                    setManualToken(s.rawToken || s.token || s.token_hash || s.tokenHash || 'ACTIVE_TOKEN_CS301');
                  }}
                  className={`w-full p-2.5 text-left rounded-lg text-xs font-medium transition border flex items-center justify-between ${
                    manualSessionId === s.id
                      ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                  }`}
                >
                  <div>
                    <span className="font-bold">{s.subject_name || s.className || 'CS-301: Algorithms & Data Structures'}</span> {s.subject_code ? `(${s.subject_code})` : ''}
                    <span className="text-slate-400 dark:text-slate-500 ml-2">• Room: {s.room || 'Hall B-204'}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">
                    Token: {(s.rawToken || s.token || s.token_hash || 'ACTIVE_TOKEN')?.slice(0, 10)}...
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Session ID
            </label>
            <input
              type="text"
              required
              value={manualSessionId}
              onChange={(e) => setManualSessionId(e.target.value)}
              placeholder="Session ID of active session"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              QR Session Token
            </label>
            <input
              type="text"
              required
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Session token string"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-slate-900 dark:bg-sky-600 hover:bg-slate-800 dark:hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            {submitting ? 'Submitting Check-in...' : 'Simulate QR Check-in'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
export default QRScanPage;
