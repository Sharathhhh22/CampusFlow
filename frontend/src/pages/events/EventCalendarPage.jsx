import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventApi } from '../../services/api';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Trophy,
  BookOpen,
  Code,
  Tag,
  ArrowRight
} from 'lucide-react';

export const EventCalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('agenda'); // agenda, monthly, weekly
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await eventApi.list();
      if (res.success && res.data) {
        setEvents(res.data);
      }
    } catch (err) {
      console.warn('Error fetching events for calendar', err);
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campus Events & Opportunity Calendar</h1>
          <p className="text-sm text-slate-500">
            Track upcoming hackathons, registration deadlines, and department workshops.
          </p>
        </div>
        
        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setViewMode('agenda')}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewMode === 'agenda' ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Agenda View
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-1.5 rounded-lg transition ${
              viewMode === 'monthly' ? 'bg-white text-indigo-600 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly View
          </button>
        </div>
      </div>

      {/* Calendar Navigation Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-base font-bold text-slate-900">
            {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Filter:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs focus:outline-none"
          >
            <option value="all">All Events & Deadlines</option>
            <option value="hackathon">Hackathons Only</option>
            <option value="workshop">Workshops Only</option>
          </select>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'agenda' ? (
        <div className="space-y-4">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center flex-shrink-0 text-indigo-700">
                  <span className="text-[10px] uppercase font-bold">
                    {new Date(evt.event_date || evt.eventDate).toLocaleDateString(undefined, { month: 'short' })}
                  </span>
                  <span className="text-lg font-black leading-none">
                    {new Date(evt.event_date || evt.eventDate).getDate()}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {evt.category}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {evt.mode}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{evt.title}</h3>
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Deadline: {new Date(evt.registration_deadline || evt.registrationDeadline).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.venue}</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Link
                  to={`/events/${evt.id}`}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"
                >
                  <span>Details & RSVP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Monthly Grid View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 text-center space-y-4">
          <div className="grid grid-cols-7 gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-xs">
            {Array.from({ length: 31 }, (_, i) => {
              const day = i + 1;
              const hasEvents = day === 14 || day === 5 || day === 8;
              return (
                <div
                  key={day}
                  className={`min-h-[80px] p-2 rounded-xl border text-left flex flex-col justify-between transition ${
                    hasEvents ? 'bg-indigo-50/60 border-indigo-200' : 'bg-slate-50/40 border-slate-100'
                  }`}
                >
                  <span className="font-bold text-slate-700">{day}</span>
                  {hasEvents && (
                    <span className="text-[10px] font-bold p-1 bg-indigo-600 text-white rounded truncate mt-1">
                      {day === 14 ? 'HackNova 2026' : day === 5 ? 'Gemini AI Workshop' : 'ByteCode Contests'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
