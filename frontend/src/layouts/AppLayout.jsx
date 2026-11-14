import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  QrCode,
  LayoutDashboard,
  CalendarCheck,
  LifeBuoy,
  ClipboardList,
  User,
  Users,
  Layers,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  School
} from 'lucide-react';

export const AppLayout = () => {
  const { user, logout, switchDemoRole } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleRoleSwitch = async (e) => {
    const newRole = e.target.value;
    const profile = await switchDemoRole(newRole);
    if (newRole === 'student') navigate('/student/dashboard');
    else if (newRole === 'faculty') navigate('/faculty/dashboard');
    else if (newRole === 'admin') navigate('/admin/dashboard');
  };

  // Student Navigation
  const studentNav = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'My Attendance', path: '/student/attendance', icon: CalendarCheck },
    { name: 'Scan QR Check-in', path: '/student/scan', icon: QrCode },
    { name: 'Report Issue', path: '/student/report-issue', icon: LifeBuoy },
    { name: 'Recovery Cases', path: '/student/cases', icon: ClipboardList },
    { name: 'My Profile', path: '/student/profile', icon: User }
  ];

  // Faculty Navigation
  const facultyNav = [
    { name: 'Command Center', path: '/faculty/dashboard', icon: LayoutDashboard },
    { name: 'Attendance Sessions', path: '/faculty/sessions', icon: QrCode },
    { name: 'Class Attendance', path: '/faculty/attendance', icon: CalendarCheck },
    { name: 'Case Review Queue', path: '/faculty/cases', icon: ClipboardList },
    { name: 'Analytics', path: '/faculty/analytics', icon: BarChart3 },
    { name: 'Profile', path: '/faculty/profile', icon: User }
  ];

  // Admin Navigation
  const adminNav = [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Classes & Sections', path: '/admin/classes', icon: Layers },
    { name: 'System Cases', path: '/admin/cases', icon: ClipboardList },
    { name: 'Institutional Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  const currentNav = user?.role === 'admin'
    ? adminNav
    : user?.role === 'faculty'
    ? facultyNav
    : studentNav;

  const roleLabels = {
    student: { title: 'Student Portal', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    faculty: { title: 'Faculty Portal', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    admin: { title: 'Admin Console', color: 'bg-purple-50 text-purple-700 border-purple-200' }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-700 rounded-lg focus:outline-none"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <NavLink to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-sky-200">
                <School className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-sky-600 transition">
                  Campus<span className="text-sky-600">Flow</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  Apex Tech
                </span>
              </div>
            </NavLink>
          </div>

          {/* Quick Demo Switcher & User Profile Pill */}
          <div className="flex items-center gap-3">
            {/* Demo Role Switcher Dropdown */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 ml-1" />
              <span className="text-slate-500 font-medium">Demo Persona:</span>
              <select
                value={user?.role || 'student'}
                onChange={handleRoleSwitch}
                className="bg-white text-slate-800 font-semibold rounded-lg px-2 py-1 border-0 shadow-sm focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="student">Student (Alex Rivera)</option>
                <option value="faculty">Faculty (Prof. Vance)</option>
                <option value="admin">Administrator (Dr. Jenkins)</option>
              </select>
            </div>

            {/* Current Role Badge */}
            <span className={`hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${roleLabels[user?.role]?.color || ''}`}>
              {roleLabels[user?.role]?.title}
            </span>

            {/* User Profile Info & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">{user?.full_name}</p>
                <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Navigation
            </div>
            {currentNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-sky-50 text-sky-700 shadow-sm shadow-sky-50'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                </NavLink>
              );
            })}

            {/* Quick Helper Banner */}
            <div className="pt-4 mt-4 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-600">
                <p className="font-semibold text-slate-800 mb-0.5 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-sky-600" />
                  Independent Mode
                </p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  CampusFlow operates independently. External college scan claims remain unverified until faculty review.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}>
            <div className="fixed inset-y-0 left-0 w-72 bg-white p-5 shadow-2xl flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <School className="w-5 h-5 text-sky-600" />
                    <span className="font-bold text-slate-900">CampusFlow</span>
                  </div>
                  <button onClick={() => setMobileOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {currentNav.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                            isActive
                              ? 'bg-sky-50 text-sky-700'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`
                        }
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 rounded-xl text-sm font-semibold transition"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content Outlet */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 CampusFlow — Agentic Attendance Trust & Recovery Platform.</p>
          <p className="text-slate-400">Independent demonstration architecture • Human-governed AI review</p>
        </div>
      </footer>
    </div>
  );
};

