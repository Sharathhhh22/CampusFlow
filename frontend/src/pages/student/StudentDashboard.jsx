import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  attendanceApi,
  caseApi,
  sessionApi,
  eventApi,
  timetableApi,
  assignmentApi
} from '../../services/api';
import { StatusBadge, LoadingSpinner, ErrorState } from '../../components/common/FeedbackStates';
import {
  CalendarCheck,
  QrCode,
  LifeBuoy,
  ClipboardList,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sparkles,
  Trophy,
  BookOpen,
  Calendar,
  Building,
  Bell
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [cases, setCases] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [histRes, casesRes, sessRes, ttRes, asgRes, evtRes] = await Promise.all([
          attendanceApi.getMyHistory(),
          caseApi.getMyCases(),
          sessionApi.getActive(),
          timetableApi.getForStudent(),
          assignmentApi.listPending(),
          eventApi.list()
        ]);

        if (histRes.success) setHistory(histRes.data || []);
        if (casesRes.success) setCases(casesRes.data || []);
        if (sessRes.success && sessRes.data) setActiveSessions([sessRes.data]);
        if (ttRes.success) setTimetable(ttRes.data || []);
        if (asgRes.success) setAssignments(asgRes.data || []);
        if (evtRes.success) setEvents((evtRes.data || []).slice(0, 3));
      } catch (err) {
        setError(err.message || 'Failed to load dashboard records');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner message="Loading your intelligent campus dashboard..." />;
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const totalCheckins = history.length;
  const pendingCases = cases.filter(c => ['submitted', 'pending_faculty_review'].includes(c.status)).length;
  const resolvedCases = cases.filter(c => ['approved', 'rejected'].includes(c.status)).length;

  return (
    <div className="space-y-6">
      {/* Welcome & AI Quick Assist Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Autonomous Student Experience</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome back, {user?.full_name}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {user?.department || 'Computer Science & Engineering'} • Reg No: {user?.reg_number || '21BCE1042'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/student/copilot"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-sm font-bold transition shadow-xs"
          >
            <Sparkles className="w-4 h-4" /> AI Copilot
          </Link>
          <Link
            to="/student/scan"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-sky-600/20"
          >
            <QrCode className="w-4 h-4" /> Scan QR Check-in
          </Link>
        </div>
      </div>

      {/* Metrics Row: Attendance Compliance & Recovery Radar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Attendance Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">92.8%</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Safe (&gt;75% Mandatory Threshold)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Check-ins</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCheckins} Verified</div>
          <p className="text-[11px] text-slate-400 mt-1">Recorded via dynamic QR token</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Assignments</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{assignments.filter(a => a.status === 'pending' || a.status === 'late_pending').length} Tasks</div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">1 deadline due in 48 hours</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">College Hackathons</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{events.length} Active</div>
          <p className="text-[11px] text-purple-700 font-medium mt-1">Apex InnoHacks open for teams</p>
        </div>
      </div>

      {/* Active Attendance Session Banner */}
      {activeSessions.length > 0 && (
        <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <h3 className="text-sm font-bold text-slate-900">Live Classroom Attendance Window Active</h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Session Open
            </span>
          </div>
          <div className="space-y-3">
            {activeSessions.map((s) => (
              <div key={s.id} className="bg-white p-4 rounded-xl border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{s.className}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Room: {s.room || 'Hall B-204'} • Total Attended: {s.totalAttended || 0} students
                  </p>
                </div>
                <Link
                  to="/student/scan"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
                >
                  <QrCode className="w-3.5 h-3.5" /> Scan QR Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Timetable & Hackathons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Timetable */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                <h3 className="font-bold text-slate-900 text-base">Academic Timetable</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Monday Schedule
              </span>
            </div>

            <div className="space-y-3">
              {timetable.map((slot) => (
                <div key={slot.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-sky-600">{slot.course_code}</span>
                      <span className="text-xs font-semibold text-slate-900">{slot.course_name}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {slot.room} • {slot.faculty} ({slot.type})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-700 font-mono">{slot.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Classroom Finder & Digital Twin</span>
            <Link to="/campus/classrooms" className="text-sky-600 font-semibold hover:underline">
              Find Study Room →
            </Link>
          </div>
        </div>

        {/* Featured Campus Events & Hackathons */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">Campus Hackathons & Workshops</h3>
              </div>
              <Link to="/events" className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                Explore All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {events.map((evt) => (
                <Link
                  key={evt.id}
                  to={`/events/${evt.id}`}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-purple-50/50 hover:border-purple-200 transition flex items-center justify-between block group"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                        {evt.category.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400">{evt.mode}</span>
                    </div>
                    <p className="font-bold text-slate-900 text-xs truncate group-hover:text-purple-700 transition">
                      {evt.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{evt.venue} • {evt.registered_count || 0} Registered</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition" />
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">View college event calendar</span>
            <Link to="/events/calendar" className="text-purple-600 font-semibold hover:underline">
              Open Calendar →
            </Link>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Attendance & Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">Recent Check-in History</h3>
            <Link to="/student/attendance" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {history.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No check-in records found yet.</p>
          ) : (
            <div className="space-y-3 flex-1">
              {history.slice(0, 5).map((r) => (
                <div key={r.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{r.class_name || r.subject_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(r.timestamp || r.recorded_at).toLocaleDateString()} at {new Date(r.timestamp || r.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • QR Verified
                    </p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Present
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Recovery Cases */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">Attendance Recovery Cases</h3>
            <Link to="/student/cases" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {cases.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No recovery requests filed.</p>
          ) : (
            <div className="space-y-3 flex-1">
              {cases.slice(0, 5).map((c) => (
                <Link
                  key={c.id}
                  to={`/student/cases/${c.id}`}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/70 transition flex items-center justify-between block group"
                >
                  <div className="min-w-0 pr-3">
                    <p className="font-bold text-slate-800 text-sm truncate group-hover:text-sky-600 transition">
                      {c.description}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Case #{c.caseNumber || c.id} • {new Date(c.createdAt || c.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    c.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {c.status.replace(/_/g, ' ')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
