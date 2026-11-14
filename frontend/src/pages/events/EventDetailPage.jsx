import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { eventApi } from '../../services/api';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Share2,
  AlertCircle,
  Sparkles,
  Plus,
  Trash2,
  Mail,
  Award
} from 'lucide-react';

export const EventDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Team registration state
  const [teamName, setTeamName] = useState('');
  const [teammates, setTeammates] = useState(['']);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    fetchEventDetails();
    if (searchParams.get('action') === 'register') {
      setShowRegisterModal(true);
    }
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await eventApi.getById(id);
      if (res.success && res.data) {
        setEvent(res.data);
      }
    } catch (err) {
      console.warn('Error fetching event details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeammate = () => {
    if (teammates.length < (event?.team_size_max || 4) - 1) {
      setTeammates([...teammates, '']);
    }
  };

  const handleRemoveTeammate = (index) => {
    setTeammates(teammates.filter((_, i) => i !== index));
  };

  const handleTeammateChange = (index, value) => {
    const updated = [...teammates];
    updated[index] = value;
    setTeammates(updated);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const isTeam = (event?.team_size_max || 1) > 1;
      const res = await eventApi.register(id, {
        registration_type: isTeam ? 'team' : 'individual',
        team_name: isTeam ? teamName : null,
        teammates: isTeam ? teammates.filter(t => t.trim().length > 0) : []
      });

      if (res.success) {
        setRegistered(true);
        setShowRegisterModal(false);
        setToastMessage(`Registration confirmed for ${event.title}!`);
        if (event) event.registered_count = (event.registered_count || 0) + 1;
      }
    } catch (err) {
      setToastMessage('Error processing registration');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">Loading event specifications...</div>;
  }

  if (!event) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Event Not Found</h2>
        <Link to="/student/events" className="text-xs font-bold text-sky-600 dark:text-sky-400">Back to Events Hub</Link>
      </div>
    );
  }

  const isTeamEvent = (event.team_size_max || 1) > 1;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Back button */}
      <div>
        <Link
          to="/student/events"
          className="inline-flex items-center text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Opportunities</span>
        </Link>
      </div>

      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg bg-slate-900 h-64 md:h-80 border border-slate-200 dark:border-slate-800">
        <img
          src={event.banner_url || event.cover_image || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&auto=format&fit=crop&q=80'}
          alt={event.title}
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg bg-sky-600 text-white shadow">
              {(event.category || 'event').replace(/_/g, ' ')}
            </span>
            <span className="text-[10px] capitalize font-semibold px-2 py-1 rounded-lg bg-white/20 backdrop-blur">
              {event.mode} Mode
            </span>
            <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-600 text-white">
              {event.is_free ? 'FREE REGISTRATION' : `₹${event.price || 0}`}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
            {event.title}
          </h1>

          <p className="text-xs md:text-sm text-slate-300 max-w-2xl">
            {event.short_description}
          </p>
        </div>
      </div>

      {/* Main Grid: Left Details & Right Action Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Event Comprehensive Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Overview Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Event Overview & Objectives</span>
            </h2>
            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {event.description}
            </div>
          </div>

          {/* Rules and Guidelines */}
          {event.rules && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Participation Rules & Guidelines</span>
              </h2>
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 font-mono text-[11px]">
                {event.rules}
              </div>
            </div>
          )}

          {/* Prizes & Incentives */}
          {event.prizes && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/10 border border-amber-200/80 dark:border-amber-800/40 rounded-2xl p-6 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-amber-950 dark:text-amber-300 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span>Prizes & Awards</span>
              </h2>
              <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed whitespace-pre-line font-medium">
                {event.prizes}
              </div>
            </div>
          )}

          {/* Eligibility & Team Configuration */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Eligibility & Format
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Participation Format</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {isTeamEvent ? `Team Event (${event.team_size_min || 2} - ${event.team_size_max || 4} Members)` : 'Individual Participation'}
                </span>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block mb-1">Eligible Batches</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{event.eligibility || 'All Department Batches Eligible'}</span>
              </div>
            </div>
          </div>

          {/* Coordinators */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
              Organizing Committee & Contacts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Faculty Coordinator</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{event.faculty_coordinator || 'Prof. Marcus Vance'}</span>
              </div>
              <div>
                <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Student Lead</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{event.student_coordinator || 'Jordan Lee'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (1 Col): Registration Card & Timelines */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-5 sticky top-20">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Status</span>
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {event.is_free ? 'Free Registration' : `₹${event.price || 0}`}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  Open
                </span>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Event Date</span>
                  <span>{new Date(event.event_date || event.eventDate || event.start_date || Date.now()).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                <Clock className="w-4 h-4 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Registration Deadline</span>
                  <span className="text-rose-600 dark:text-rose-400 font-medium">
                    {new Date(event.registration_deadline || event.registrationDeadline || Date.now() + 86400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                <MapPin className="w-4 h-4 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Venue</span>
                  <span>{event.venue || 'Campus Auditorium'}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-slate-600 dark:text-slate-300">
                <Users className="w-4 h-4 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Seats Remaining</span>
                  <span>{Math.max(0, (event.max_capacity || event.capacity || 100) - (event.registered_count || 0))} of {event.max_capacity || event.capacity || 100} remaining</span>
                </div>
              </div>
            </div>

            {/* Registration Action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              {registered ? (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs text-center font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>You are Registered for this Event!</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-200 dark:shadow-none transition flex items-center justify-center gap-1.5"
                >
                  <Award className="w-4 h-4" />
                  <span>{isTeamEvent ? 'Register as Team' : 'Register Now'}</span>
                </button>
              )}
            </div>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
              Verified registrations earn an official institutional attendance exemption record during event hours.
            </p>
          </div>

        </div>

      </div>

      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {isTeamEvent ? 'Team Event Registration' : 'Individual Event Registration'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{event.title}</p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              
              {/* Primary Leader Info */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Registrant / Team Leader</span>
                <div className="font-bold text-slate-900 dark:text-white">{user?.name || user?.full_name}</div>
                <div className="text-slate-500 dark:text-slate-400">{user?.email} • {user?.reg_number || '21BCE1042'}</div>
              </div>

              {/* If Team Event: Team Name & Teammates */}
              {isTeamEvent && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Neural Pioneers"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Teammates (Up to {(event.team_size_max || 4) - 1} additional members)
                      </label>
                      {teammates.length < (event.team_size_max || 4) - 1 && (
                        <button
                          type="button"
                          onClick={handleAddTeammate}
                          className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:text-sky-800 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Teammate</span>
                        </button>
                      )}
                    </div>

                    {teammates.map((mate, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder={`Teammate #${idx + 1} Reg Number or Email`}
                          value={mate}
                          onChange={(e) => handleTeammateChange(idx, e.target.value)}
                          className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                        {teammates.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTeammate(idx)}
                            className="p-2 text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? 'Confirming...' : 'Confirm Registration'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Floating Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-xl shadow-xl text-xs font-medium flex items-center gap-2 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
