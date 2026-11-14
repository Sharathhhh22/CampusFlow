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
  const [manualSessionId, setManualSessionId] = useState('');
  const [manualToken, setManualToken] = useState('');
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
        if (res.success && res.data.length > 0) {
          setActiveSessions(res.data);
          setManualSessionId(res.data[0].id);
          setManualToken(res.data[0].token || res.data[0].token_hash || 'demo_token_hash_cs601');
        }
      } catch (e) {
        // ignore
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
            sessionId = manualSessionId;
          }

          if (!sessionId) {
            setScanError('QR code missing valid CampusFlow session metadata.');
            return;
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
      }
    } catch (err) {
      setScanError(err.message || 'Failed to record check-in.');
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
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">QR Attendance Check-in</h1>
        <p className="text-sm text-slate-500 mt-1">
          Scan the faculty-displayed CampusFlow QR code or use the demo test panel below.
        </p>
      </div>

      {/* Success Banner */}
      {scanResult && (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-emerald-900">Attendance Recorded Successfully!</h3>
          <p className="text-xs text-emerald-700">
            Recorded status: <span className="font-semibold uppercase">{scanResult.attendance_status}</span> • Server timestamp: {new Date(scanResult.recorded_at).toLocaleTimeString()}
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
              className="px-4 py-2 bg-white text-emerald-700 border border-emerald-300 rounded-xl text-xs font-semibold hover:bg-emerald-50 transition"
            >
              Scan Another Session
            </button>
          </div>
        </div>
      )}

      {/* Failure / Error Banner */}
      {scanError && (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-rose-900">Attendance Verification Failed</h3>
              <p className="text-xs text-rose-700 mt-1">{scanError}</p>
            </div>
          </div>
          <div className="pt-2 flex items-center justify-between border-t border-rose-200/60">
            <span className="text-xs text-slate-500">Experienced a network error or scan timeout?</span>
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
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center">
        <h3 className="text-base font-bold text-slate-900 mb-2">Camera Scanner</h3>
        <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
          Position your device camera towards the faculty session QR screen.
        </p>

        {cameraActive ? (
          <div>
            <div id="qr-reader" className="mx-auto max-w-md rounded-xl overflow-hidden border border-slate-200" />
            <button
              onClick={() => setCameraActive(false)}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              Stop Camera
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCameraActive(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-sky-200"
          >
            <QrCode className="w-4 h-4" /> Start Device Camera Scanner
          </button>
        )}
      </div>

      {/* Demo Manual Check-in Simulator */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> Demo Check-in Simulator
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Allows evaluators to test attendance submission without a second physical device.
            </p>
          </div>
          {activeSessions.length > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {activeSessions.length} Active Session(s)
            </span>
          )}
        </div>

        {activeSessions.length > 0 && (
          <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Select Active Session to Test:
            </span>
            <div className="space-y-1.5">
              {activeSessions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setManualSessionId(s.id);
                    setManualToken(s.token || s.token_hash);
                  }}
                  className={`w-full p-2.5 text-left rounded-lg text-xs font-medium transition border flex items-center justify-between ${
                    manualSessionId === s.id
                      ? 'bg-sky-50 text-sky-800 border-sky-300 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <span className="font-bold">{s.subject_name}</span> ({s.subject_code})
                    <span className="text-slate-400 ml-2">• Section: {s.section}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                    Token: {(s.token || s.token_hash)?.slice(0, 8)}...
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Session ID
            </label>
            <input
              type="text"
              required
              value={manualSessionId}
              onChange={(e) => setManualSessionId(e.target.value)}
              placeholder="UUID of active session"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              QR Session Token
            </label>
            <input
              type="text"
              required
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              placeholder="Session token string"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
          >
            {submitting ? 'Submitting Check-in...' : 'Simulate QR Check-in'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

