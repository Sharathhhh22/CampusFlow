import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../../contexts/ThemeContext';
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
  CheckCircle2,
  Workflow,
  Cpu,
  Trophy
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white transition-colors duration-150">
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors duration-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-200 dark:shadow-none">
              <School className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Campus<span className="text-sky-600 dark:text-sky-400">Flow</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Switcher Toggle */}
            <ThemeToggle />

            {user ? (
              <Link
                to={`/${user.role}/dashboard`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition shadow-sm"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold text-sm transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-semibold transition shadow-sm"
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200/80 dark:border-sky-800 text-sky-700 dark:text-sky-300 text-xs font-semibold mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          Autonomous Multi-Agent Smart Campus Platform
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          Autonomous Campus Operations. <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-indigo-600 dark:from-sky-400 dark:to-indigo-400">
            Intelligent Swarm & Hackathons.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          CampusFlow combines cryptographic attendance tokens with an Autonomous Multi-Agent Swarm for conflict-free timetables, smart classroom occupancy, AI-summarized circulars, and college hackathons.
        </p>

        {/* Quick Instant Demo Launchers */}
        <div className="mt-10 max-w-xl mx-auto p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-150">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 text-center">
            Instant Demo Logins (One-Click Role Preview)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemo('student')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold transition border border-emerald-200 dark:border-emerald-800"
            >
              <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Student Portal
            </button>
            <button
              onClick={() => handleQuickDemo('faculty')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-sky-800 dark:text-sky-300 text-xs font-bold transition border border-sky-200 dark:border-sky-800"
            >
              <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              Faculty Center
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-800 dark:text-purple-300 text-xs font-bold transition border border-purple-200 dark:border-purple-800"
            >
              <BarChart className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Admin Console
            </button>
          </div>
        </div>

        {/* Key Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white dark:bg-slate-900 p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-150">
            <div className="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Cryptographic QR Verification</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Independent session tokens with SHA-256 storage, dynamic rotation, and server-side atomic validation preventing duplicate check-ins.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-150">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <Workflow className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Autonomous Multi-Agent Swarm</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Timetable, Resource, Grievance, Notification, and Attendance agents coordinate automated workflows with human-in-the-loop admin approval.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-150">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Events & Hackathons Hub</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Discover college hackathons, technical workshops, individual/team registrations, waitlists, and interactive calendars.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-150">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 CampusFlow — Autonomous Smart Campus Platform.</p>
          <p className="text-slate-400 dark:text-slate-500">Production-grade Dark Mode • Human-Governed AI Review</p>
        </div>
      </footer>
    </div>
  );
};
