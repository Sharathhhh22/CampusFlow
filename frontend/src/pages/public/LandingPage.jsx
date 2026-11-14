import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  ShieldCheck,
  QrCode,
  Sparkles,
  ArrowRight,
  LifeBuoy,
  FileText,
  Lock,
  BarChart,
  School,
  CheckCircle2
} from 'lucide-react';

export const LandingPage = () => {
  const { user, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async (role) => {
    await switchDemoRole(role);
    if (role === 'student') navigate('/student/dashboard');
    else if (role === 'faculty') navigate('/faculty/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-200">
              <School className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Campus<span className="text-sky-600">Flow</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={`/${user.role}/dashboard`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold text-sm transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-semibold transition shadow-sm shadow-sky-200"
                >
                  Student Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center flex-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-sky-700 text-xs font-semibold mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          Autonomous Agentic AI Attendance Platform
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          Fair Attendance. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600">
            Fewer Disputes. Less Manual Work.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          CampusFlow combines an independent cryptographic QR check-in engine with specialized Multi-Agent AI to investigate technical scan failures and attendance anomalies — keeping human faculty in complete control.
        </p>

        {/* Quick Instant Demo Launchers */}
        <div className="mt-10 max-w-xl mx-auto p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
            Instant Demo Logins (One-Click Role Preview)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemo('student')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 text-xs font-bold transition border border-emerald-200"
            >
              <QrCode className="w-4 h-4 text-emerald-600" />
              Student Portal
            </button>
            <button
              onClick={() => handleQuickDemo('faculty')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-sky-50 hover:bg-sky-100/80 text-sky-800 text-xs font-bold transition border border-sky-200"
            >
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              Faculty Center
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-purple-50 hover:bg-purple-100/80 text-purple-800 text-xs font-bold transition border border-purple-200"
            >
              <BarChart className="w-4 h-4 text-purple-600" />
              Admin Console
            </button>
          </div>
        </div>

        {/* Key Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Cryptographic QR Verification</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Independent, random session tokens with SHA-256 storage, server-side expiration validation, and atomic database constraints preventing duplicate check-ins.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">4-Agent AI Investigation Engine</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Coordinator, Integrity, Recovery, and Evidence agents evaluate server telemetry, correlate network anomalies, and compile structured faculty dossiers.
            </p>
          </div>

          <div className="bg-white p-7 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Human-in-the-Loop Decisions</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              AI agents advise and synthesize evidence, but authorized faculty make the final decision with mandatory recorded reasons and full immutable audit trails.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

