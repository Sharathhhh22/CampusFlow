import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { eventApi } from '../../services/api';
import {
  Sparkles,
  Calendar,
  MapPin,
  Users,
  Search,
  Filter,
  Trophy,
  ArrowRight,
  Code,
  BookOpen,
  Laptop,
  CheckCircle2,
  Clock,
  Layers,
  Tag
} from 'lucide-react';

export const EventsDiscoveryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [recommendations, setRecommendations] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await eventApi.list();
      if (res.success && res.data) {
        setEvents(res.data);
      }
      const recRes = await eventApi.getRecommendations();
      if (recRes.success && recRes.data) {
        setRecommendations(recRes.data);
      }
    } catch (err) {
      console.warn('Events fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Opportunities', icon: Layers },
    { id: 'hackathon', label: 'Hackathons', icon: Trophy },
    { id: 'workshop', label: 'Workshops', icon: BookOpen },
    { id: 'coding_competition', label: 'Coding Contests', icon: Code },
    { id: 'guest_lecture', label: 'Guest Lectures', icon: Laptop },
    { id: 'seminar', label: 'Seminars & Talks', icon: Sparkles }
  ];

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (e.short_description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (e.organizer || e.organizing_department || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
    const matchesMode = modeFilter === 'all' || e.mode === modeFilter;
    return matchesSearch && matchesCategory && matchesMode;
  });

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl border border-indigo-900/30">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>CampusFlow Events & Opportunities Hub</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Discover Hackathons, Technical Masterclasses & Competitions
          </h1>
          <p className="text-sm text-indigo-200">
            Verified opportunities organized by your department, faculty, and partner tech institutions. Level up your portfolio, compete with teams, and earn certifications.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/events/calendar"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/30 gap-1.5"
            >
              <Calendar className="w-4 h-4" />
              <span>Interactive Event Calendar</span>
            </Link>
            {user?.role === 'admin' || user?.role === 'faculty' ? (
              <Link
                to="/events/manage"
                className="inline-flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur transition gap-1.5 border border-white/20"
              >
                <Users className="w-4 h-4" />
                <span>Event Coordinator Portal</span>
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* AI Recommendation Banner */}
      {recommendations && (
        <div className="bg-gradient-to-r from-indigo-50 to-sky-50 dark:from-indigo-950/40 dark:to-sky-950/40 border border-indigo-200/80 dark:border-indigo-800 rounded-2xl p-5 shadow-xs transition-colors duration-150">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-200 dark:shadow-none">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider">AI Event Discovery Copilot</span>
                <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-100/70 dark:bg-indigo-900/60 px-2.5 py-0.5 rounded-full">Personalized for 3rd Year CSE</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {recommendations.matchReason || 'Top matches for Computer Science & Engineering students interested in Autonomous AI and Hackathons.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Category Filter Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs space-y-4 transition-colors duration-150">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search hackathons, AI workshops, topics, or organizers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50/50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Modes (Online & Offline)</option>
              <option value="offline">In-Person on Campus</option>
              <option value="online">Virtual / Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c) => {
            const Icon = c.icon;
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs">Loading opportunities...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3 transition-colors duration-150">
          <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No events matched your filter</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Try adjusting your search criteria or category pill.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((evt) => {
            const maxCap = evt.capacity || evt.max_capacity || 100;
            const regCount = evt.registered_count || 0;
            const capacityRatio = maxCap > 0 ? (regCount / maxCap) * 100 : 0;
            const isAlmostFull = capacityRatio >= 80;

            return (
              <div
                key={evt.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group"
              >
                {/* Banner Image */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={evt.cover_image || evt.banner_url || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80'}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
                  
                  {/* Category & Mode Badge */}
                  <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg bg-indigo-600/90 text-white backdrop-blur">
                      {evt.category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[10px] capitalize font-semibold px-2 py-1 rounded-lg bg-black/60 text-white backdrop-blur">
                      {evt.mode}
                    </span>
                  </div>

                  {/* Date badge */}
                  <div className="absolute bottom-3 left-3 text-white flex items-center space-x-1.5 text-xs font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-indigo-300" />
                    <span>{new Date(evt.start_date || evt.event_date || evt.eventDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {evt.short_description || evt.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center text-slate-500 dark:text-slate-400 gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{evt.venue}</span>
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{evt.organizer || evt.organizing_department}</span>
                    </div>

                    {/* Capacity Indicator */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
                        <span>Capacity ({regCount} / {maxCap} enrolled)</span>
                        <span className={isAlmostFull ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500 dark:text-slate-400'}>
                          {isAlmostFull ? 'Almost Full' : `${Math.round(capacityRatio)}%`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isAlmostFull ? 'bg-rose-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${Math.min(capacityRatio, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <Link
                      to={`/events/${evt.id}`}
                      className="flex-1 py-2 text-center text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl transition"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/events/${evt.id}`}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-1"
                    >
                      <span>Register</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
