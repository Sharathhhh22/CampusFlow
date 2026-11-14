import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { attendanceApi, sessionApi } from '../../services/api';
import { ThemeSegmentedControl, useTheme } from '../../contexts/ThemeContext';
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  LifeBuoy,
  RefreshCw,
  Clock,
  Sparkles,
  ArrowRight,
  Camera,
  CameraOff,
  Video,
  VideoOff,
  ShieldAlert,
  ShieldCheck,
  SwitchCamera,
  Lock,
  Sun,
  Moon
} from 'lucide-react';

export const QRScanPage = () => {
  const { theme, effectiveTheme, setTheme } = useTheme();

  // Active Sessions & Manual Demo Form
  const [activeSessions, setActiveSessions] = useState([]);
  const [manualSessionId, setManualSessionId] = useState('ses-102');
  const [manualToken, setManualToken] = useState('ACTIVE_TOKEN_CS301');
  const [submitting, setSubmitting] = useState(false);

  // Scan Results & Errors
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);

  // Camera Permission & Live Scanner States
  // 'idle' | 'requesting' | 'granted' | 'denied' | 'not_found' | 'unsupported'
  const [permissionStatus, setPermissionStatus] = useState('requesting');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) | 'user' (front)

  const html5QrCodeRef = useRef(null);
  const isStartingRef = useRef(false);
  const navigate = useNavigate();

  // 1. Load active sessions for manual check-in simulator fallback
  useEffect(() => {
    let isMounted = true;
    const fetchActiveSessions = async () => {
      try {
        const res = await sessionApi.list({ status: 'active' });
        if (isMounted && res.success && res.data && res.data.length > 0) {
          setActiveSessions(res.data);
          const active = res.data.find(s => s.status === 'active') || res.data[0];
          setManualSessionId(active.id);
          setManualToken(active.rawToken || active.token || active.tokenHash || active.token_hash || 'ACTIVE_TOKEN_CS301');
        } else if (isMounted) {
          setManualSessionId('ses-102');
          setManualToken('ACTIVE_TOKEN_CS301');
        }
      } catch (e) {
        if (isMounted) {
          setManualSessionId('ses-102');
          setManualToken('ACTIVE_TOKEN_CS301');
        }
      }
    };
    fetchActiveSessions();
    return () => { isMounted = false; };
  }, []);

  // 2. Start Camera Engine & Ask Native Browser Permission
  const startCamera = async (currentFacing = facingMode) => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    setPermissionStatus('requesting');
    setCameraError(null);

    // Stop and clear any previous instance
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {
        // quiet cleanup
      }
    }

    try {
      // Check browser MediaDevices capability
      if (!navigator?.mediaDevices?.getUserMedia) {
        setPermissionStatus('unsupported');
        setCameraError('Camera API is not supported by your browser or connection is not secure (HTTPS required).');
        isStartingRef.current = false;
        return;
      }

      // Explicitly call getUserMedia to trigger the browser's native permission prompt
      const testStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: currentFacing } }
      });

      // Browser granted permission! Release the initial test track
      testStream.getTracks().forEach((track) => track.stop());
      setPermissionStatus('granted');

      // Initialize Html5Qrcode directly on the viewfinder element
      const qrScanner = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = qrScanner;

      await qrScanner.start(
        { facingMode: currentFacing },
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const edgeSize = Math.floor(minEdge * 0.72);
            return { width: Math.max(edgeSize, 220), height: Math.max(edgeSize, 220) };
          },
          aspectRatio: 1.0
        },
        async (decodedText) => {
          // Success: QR Code scanned!
          try {
            let sessionId = '';
            let token = '';

            try {
              const parsed = JSON.parse(decodedText);
              sessionId = parsed.session_id || parsed.sessionId || parsed.id;
              token = parsed.token || parsed.rawToken;
            } catch (e) {
              token = decodedText;
              sessionId = manualSessionId || 'ses-102';
            }

            if (!sessionId) {
              sessionId = manualSessionId || 'ses-102';
            }

            // Pause scanner temporarily while recording
            if (html5QrCodeRef.current?.isScanning) {
              try {
                await html5QrCodeRef.current.pause();
              } catch (e) {}
            }

            await submitCheckIn(sessionId, token);

            // Resume scanning after 4 seconds
            setTimeout(() => {
              if (html5QrCodeRef.current) {
                try {
                  html5QrCodeRef.current.resume();
                } catch (e) {}
              }
            }, 4000);
          } catch (err) {
            setScanError(err.message || 'Error processing QR code scan');
          }
        },
        (errorMessage) => {
          // Per-frame pass (no QR in sight), suppress noise
        }
      );

      setCameraActive(true);
      isStartingRef.current = false;
    } catch (err) {
      console.warn('Camera permission / start error:', err);
      isStartingRef.current = false;
      setCameraActive(false);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionStatus('denied');
        setCameraError('Camera access was denied. Please allow camera permissions in your browser address bar icon, then click "Grant Camera Permission".');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setPermissionStatus('not_found');
        setCameraError('No camera hardware was detected on this device. You can verify attendance using the Demo Simulator below.');
      } else {
        setPermissionStatus('error');
        setCameraError(err.message || 'Unable to open camera.');
      }
    }
  };

  // 3. Stop Camera
  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Error stopping camera:', e);
      }
    }
    setCameraActive(false);
  };

  // 4. Flip Facing Mode (Rear vs Front Camera)
  const toggleFacingMode = async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    if (cameraActive) {
      await stopCamera();
      setTimeout(() => {
        startCamera(nextFacing);
      }, 300);
    }
  };

  // 5. AUTO-INITIALIZE ON PAGE ARRIVAL
  // As requested: When the student enters this page, automatically ask camera permission and boot scanner!
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted) {
        startCamera(facingMode);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            html5QrCodeRef.current.stop().then(() => {
              html5QrCodeRef.current.clear();
            }).catch(() => {});
          } else {
            html5QrCodeRef.current.clear();
          }
        } catch (e) {}
      }
    };
  }, []);

  // 6. Submit Check-in to API with local fallback
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

  // 7. Manual Check-in Submission
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualSessionId || !manualToken) {
      setScanError('Please enter both session ID and token.');
      return;
    }
    submitCheckIn(manualSessionId, manualToken);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Top Header Card with Integrated Theme Switcher */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">QR Attendance Check-in</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              Live Scanner
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Automatic camera verification with instant fallback simulator.
          </p>
        </div>

        {/* Dedicated Dark Mode / Light Mode Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-2 pr-1 flex items-center gap-1">
            {effectiveTheme === 'dark' ? <Moon className="w-3.5 h-3.5 text-sky-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            Theme:
          </span>
          <ThemeSegmentedControl className="border-0 bg-transparent p-0" />
        </div>
      </div>

      {/* Success Notification Banner */}
      {scanResult && (
        <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-3 transition-colors shadow-xs animate-in fade-in duration-300">
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">Attendance Recorded Successfully!</h3>
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            Recorded status: <span className="font-semibold uppercase tracking-wider">{scanResult.attendance_status || scanResult.status || 'PRESENT'}</span> • Timestamp: {scanResult.recorded_at ? new Date(scanResult.recorded_at).toLocaleTimeString() : new Date().toLocaleTimeString()}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              to="/student/attendance"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              View in Attendance Ledger
            </Link>
            <button
              onClick={() => { setScanResult(null); setScanError(null); }}
              className="px-4 py-2 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Scan Another Session
            </button>
          </div>
        </div>
      )}

      {/* Verification Failure / Error Banner */}
      {scanError && (
        <div className="p-6 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl space-y-3 transition-colors shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">Attendance Verification Notice</h3>
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

      {/* Primary Camera Scanner Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              Camera Scanner
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Position your device camera directly in front of the classroom session QR code.
            </p>
          </div>

          {/* Camera Status Badge */}
          {cameraActive && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Live Camera
            </span>
          )}
        </div>

        {/* Viewfinder Container */}
        <div className="relative mx-auto max-w-md rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 min-h-[300px] flex items-center justify-center">
          {/* Real Html5Qrcode DOM Node */}
          <div id="qr-reader" className="w-full h-full" />

          {/* Permission State Overlays */}

          {/* 1. Requesting Permission State */}
          {permissionStatus === 'requesting' && (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
              <div className="w-12 h-12 rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-400 animate-spin">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-white">Requesting Camera Access...</h4>
              <p className="text-xs text-slate-300 max-w-xs">
                Please click <strong>"Allow"</strong> when your browser prompts for camera permissions to start scanning.
              </p>
            </div>
          )}

          {/* 2. Permission Denied State */}
          {permissionStatus === 'denied' && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-400">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-white">Camera Permission Blocked</h4>
              <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
                Your browser blocked camera access. Click the <strong>camera / lock icon</strong> in your browser address bar to allow access.
              </p>
              <div className="pt-2 flex flex-col gap-2 w-full max-w-xs">
                <button
                  type="button"
                  onClick={() => startCamera(facingMode)}
                  className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Camera className="w-4 h-4" /> Grant Camera Permission
                </button>
              </div>
            </div>
          )}

          {/* 3. Hardware Not Found or Unsupported State */}
          {(permissionStatus === 'not_found' || permissionStatus === 'unsupported') && (
            <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400">
                <CameraOff className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-white">No Camera Detected</h4>
              <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
                {cameraError || 'No webcam was detected on this device. You can verify attendance using the Demo Simulator below.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  const simulatorElem = document.getElementById('demo-simulator-card');
                  simulatorElem?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> Jump to Demo Simulator
              </button>
            </div>
          )}

          {/* 4. Stopped Camera State */}
          {!cameraActive && permissionStatus === 'granted' && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                <VideoOff className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-white">Camera Scanner Paused</h4>
              <p className="text-xs text-slate-400 max-w-xs">
                Click below to resume scanning the session QR code.
              </p>
              <button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="py-2.5 px-5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Video className="w-4 h-4" /> Resume Camera Scanner
              </button>
            </div>
          )}
        </div>

        {/* Camera Control Toolbar */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          {cameraActive ? (
            <button
              type="button"
              onClick={stopCamera}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <CameraOff className="w-3.5 h-3.5" /> Stop Camera
            </button>
          ) : (
            <button
              type="button"
              onClick={() => startCamera(facingMode)}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Camera className="w-3.5 h-3.5" /> Start Camera
            </button>
          )}

          <button
            type="button"
            onClick={toggleFacingMode}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="Switch between front and rear cameras"
          >
            <SwitchCamera className="w-3.5 h-3.5" />
            Switch Lens ({facingMode === 'environment' ? 'Rear' : 'Front'})
          </button>
        </div>
      </div>

      {/* Demo Manual Check-in Simulator */}
      <div id="demo-simulator-card" className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> Demo Check-in Simulator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Allows evaluators to test attendance verification without requiring a second physical screen.
            </p>
          </div>
          {activeSessions.length > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
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
                  className={`w-full p-2.5 text-left rounded-lg text-xs font-medium transition border flex items-center justify-between cursor-pointer ${
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
