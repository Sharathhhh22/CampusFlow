import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { eventApi } from '../../services/api';
import {
  Calendar,
  Plus,
  Users,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  FileDown,
  Edit,
  Trash2,
  AlertCircle,
  Filter,
  Check,
  Trophy,
  Tag,
  ShieldCheck
} from 'lucide-react';

export const EventManagementPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State for New Event
  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    description: '',
    category: 'hackathon',
    organizing_department: 'Computer Science & Engineering',
    venue: '',
    mode: 'offline',
    capacity: 100,
    min_team_size: 1,
    max_team_size: 4,
    start_date: '',
    end_date: '',
    registration_deadline: '',
    prizes: '',
    rules: '',
    cover_image: ''
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await eventApi.list();
      if (res.success && res.data) {
        setEvents(res.data);
        if (res.data.length > 0 && !selectedEvent) {
          setSelectedEvent(res.data[0]);
          loadRegistrations(res.data[0].id);
        }
      }
    } catch (err) {
      showNotice('Failed to load events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadRegistrations = async (eventId) => {
    try {
      const res = await eventApi.getRegistrations(eventId);
      if (res.success && res.data) {
        setRegistrations(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectEvent = (evt) => {
    setSelectedEvent(evt);
    loadRegistrations(evt.id);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.venue) {
      showNotice('Please complete required fields (Title, Venue).', 'error');
      return;
    }
    try {
      const res = await eventApi.create({
        ...formData,
        organizer: user?.full_name || 'Department Coordinator'
      });
      if (res.success) {
        showNotice('Event published successfully to student portal!', 'success');
        setShowCreateModal(false);
        setFormData({
          title: '',
          short_description: '',
          description: '',
          category: 'hackathon',
          organizing_department: 'Computer Science & Engineering',
          venue: '',
          mode: 'offline',
          capacity: 100,
          min_team_size: 1,
          max_team_size: 4,
          start_date: '',
          end_date: '',
          registration_deadline: '',
          prizes: '',
          rules: '',
          cover_image: ''
        });
        loadEvents();
      }
    } catch (err) {
      showNotice(err.message || 'Error creating event', 'error');
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Are you sure you want to unpublish and delete this event?')) return;
    try {
      const res = await eventApi.delete(id);
      if (res.success) {
        showNotice('Event deleted', 'info');
        loadEvents();
      }
    } catch (err) {
      showNotice('Error deleting event', 'error');
    }
  };

  const exportRosterCSV = () => {
    if (!selectedEvent) return;
    const header = 'Registration ID,Event Title,Team/Participant,Type,Status,Date\n';
    const rows = registrations.map(r =>
      `"${r.id}","${selectedEvent.title}","${r.team_name || r.user_id}","${r.registration_type}","${r.status}","${new Date(r.created_at).toLocaleDateString()}"`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEvent.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_participants.csv`;
    a.click();
    showNotice('Participant roster exported as CSV', 'success');
  };

  const showNotice = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl font-medium text-sm text-white flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-600' : toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-900'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Event Operations Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Campus Events & Hackathons Manager
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Publish hackathons, coordinate registrations, manage participant rosters, and export reports.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-sky-600 hover:bg-sky-500 shadow-sm shadow-sky-600/20 transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Event</span>
        </button>
      </div>

      {/* Two-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Events List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Published Events ({events.length})
            </h2>
            <span className="text-xs text-slate-400">Select to inspect</span>
          </div>

          <div className="space-y-3">
            {events.map((evt) => {
              const isSelected = selectedEvent?.id === evt.id;
              const fillPct = Math.min(100, Math.round(((evt.registered_count || 0) / evt.capacity) * 100));

              return (
                <div
                  key={evt.id}
                  onClick={() => handleSelectEvent(evt)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50/50 border-sky-300 ring-1 ring-sky-300 shadow-sm'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 mb-1.5">
                        {evt.category.replace('_', ' ')}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900 leading-snug">
                        {evt.title}
                      </h3>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(evt.id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{evt.registered_count || 0} / {evt.capacity} Enrolled</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[120px]">{evt.venue}</span>
                    </div>
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-2.5 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        fillPct >= 90 ? 'bg-amber-500' : 'bg-sky-500'
                      }`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Event Detail & Participant Roster */}
        <div className="lg:col-span-7 space-y-6">
          {selectedEvent ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
              {/* Event Summary Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active Enrollment
                    </span>
                    <span className="text-xs text-slate-400">ID: {selectedEvent.id}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{selectedEvent.title}</h2>
                  <p className="text-xs text-slate-500 mt-1">Organized by {selectedEvent.organizer}</p>
                </div>
                <button
                  onClick={exportRosterCSV}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>

              {/* Event Stat Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[11px] font-medium text-slate-500">Venue</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5 truncate">{selectedEvent.venue}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[11px] font-medium text-slate-500">Format</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5 capitalize">{selectedEvent.mode}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[11px] font-medium text-slate-500">Capacity</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{selectedEvent.registered_count || 0} / {selectedEvent.capacity}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[11px] font-medium text-slate-500">Team Size</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{selectedEvent.min_team_size} - {selectedEvent.max_team_size} Members</p>
                </div>
              </div>

              {/* Registrations List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Participant Registrations ({registrations.length})
                  </h3>
                  <span className="text-xs text-slate-500">Auto-verified</span>
                </div>

                {registrations.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs">
                    No student registrations received for this event yet.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {registrations.map((reg) => (
                      <div
                        key={reg.id}
                        className="p-3.5 rounded-xl border border-slate-200/80 bg-white flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900">
                              {reg.team_name || reg.user_id}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                              reg.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {reg.status}
                            </span>
                          </div>
                          {reg.team_members && reg.team_members.length > 0 && (
                            <p className="text-[11px] text-slate-500 mt-1">
                              Members: {reg.team_members.join(', ')}
                            </p>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(reg.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
              Select an event on the left to inspect registrations.
            </div>
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Publish New College Event</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex InnoHacks 2026: Campus Smart Hackathon"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="hackathon">Hackathon</option>
                    <option value="workshop">Technical Workshop</option>
                    <option value="guest_lecture">Guest Lecture</option>
                    <option value="coding_competition">Coding Competition</option>
                    <option value="seminar">Seminar / Symposium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Mode
                  </label>
                  <select
                    value={formData.mode}
                    onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  >
                    <option value="offline">In-Person (Campus)</option>
                    <option value="online">Online / Virtual</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Campus Venue / Online Link *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Auditorium Hall 1 or Zoom Link"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Max Participant Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Min Team Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.min_team_size}
                    onChange={(e) => setFormData({ ...formData, min_team_size: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Max Team Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.max_team_size}
                    onChange={(e) => setFormData({ ...formData, max_team_size: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description & Objectives
                </label>
                <textarea
                  rows="3"
                  placeholder="Provide comprehensive details about themes, challenge tracks, and expectations..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Prizes & Rewards
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1st: ₹50,000 | 2nd: ₹25,000 | Swag Bags"
                  value={formData.prizes}
                  onChange={(e) => setFormData({ ...formData, prizes: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 shadow-sm transition-all"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
