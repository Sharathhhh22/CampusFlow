import React, { useState, useEffect } from 'react';
import { classroomApi } from '../../services/api';
import {
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Clock,
  Tv,
  Wind,
  Video,
  Monitor,
  Users,
  Building,
  Check,
  AlertCircle
} from 'lucide-react';

export const ClassroomFinderPage = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRoomToBook, setSelectedRoomToBook] = useState(null);
  const [bookingPurpose, setBookingPurpose] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadClassrooms();
  }, []);

  const loadClassrooms = async () => {
    try {
      setLoading(true);
      const res = await classroomApi.list();
      if (res.success && res.data) {
        setRooms(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoomToBook || !bookingPurpose) return;

    try {
      const res = await classroomApi.book({
        roomId: selectedRoomToBook.id,
        roomCode: selectedRoomToBook.code,
        purpose: bookingPurpose
      });
      if (res.success) {
        setToast({ msg: res.message, type: 'success' });
        setSelectedRoomToBook(null);
        setBookingPurpose('');
        loadClassrooms();
      }
    } catch (err) {
      setToast({ msg: 'Failed to reserve facility', type: 'error' });
    }
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = rooms.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.building.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBuilding = selectedBuilding === 'all' || r.building === selectedBuilding;
    const matchesType = selectedType === 'all' || r.type === selectedType;
    return matchesSearch && matchesBuilding && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl font-medium text-sm text-white flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sky-600 font-semibold text-xs tracking-wider uppercase mb-1">
          <Building className="w-4 h-4" />
          <span>Campus Facility Navigator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Smart Classroom & Lab Finder
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Instant search, availability check, and on-demand reservations for lecture halls, laboratories, and seminar spaces.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by room name, code (e.g. B-204) or building..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <select
          value={selectedBuilding}
          onChange={(e) => setSelectedBuilding(e.target.value)}
          className="px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="all">All Buildings</option>
          <option value="Engineering Block A">Engineering Block A</option>
          <option value="Science & Computing Block B">Science & Computing Block B</option>
          <option value="Technology Tower C">Technology Tower C</option>
          <option value="Central Library">Central Library</option>
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option value="all">All Room Types</option>
          <option value="lecture_hall">Lecture Halls</option>
          <option value="computing_lab">Computing Labs</option>
          <option value="seminar_hall">Seminar Rooms</option>
          <option value="auditorium">Auditoriums</option>
        </select>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((room) => {
          const isAvail = room.status === 'available';

          return (
            <div
              key={room.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {room.code}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                    isAvail
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : room.status === 'reserved'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {room.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-3">{room.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{room.building} • Floor {room.floor}</p>

                {/* Features & Capacity */}
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{room.capacity} Maximum Capacity</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{isAvail ? 'Available Now' : 'In Session'}</span>
                  </div>
                </div>

                {/* Amenities Badges */}
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {room.has_projector && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                      <Tv className="w-3 h-3 text-slate-500" /> 4K Projector
                    </span>
                  )}
                  {room.has_ac && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                      <Wind className="w-3 h-3 text-slate-500" /> Climate AC
                    </span>
                  )}
                  {room.has_video_conferencing && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                      <Video className="w-3 h-3 text-slate-500" /> Telepresence
                    </span>
                  )}
                  {room.has_smartboard && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700">
                      <Monitor className="w-3 h-3 text-slate-500" /> Smartboard
                    </span>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {isAvail ? 'Instant reservation open' : 'Busy until slot completes'}
                </span>
                <button
                  onClick={() => setSelectedRoomToBook(room)}
                  disabled={!isAvail}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isAvail
                      ? 'bg-sky-600 text-white hover:bg-sky-500 shadow-sm'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isAvail ? 'Reserve Room' : 'Unavailable'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Modal */}
      {selectedRoomToBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Reserve {selectedRoomToBook.name} ({selectedRoomToBook.code})
              </h2>
              <button
                onClick={() => setSelectedRoomToBook(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Purpose / Course / Activity *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Study Group Session or Makeup Lecture"
                  value={bookingPurpose}
                  onChange={(e) => setBookingPurpose(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-xs text-sky-800 space-y-1">
                <p className="font-semibold">Automated Campus Resource Verification</p>
                <p>Campus Resource Agent will lock the digital smart lock and notify facility management.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedRoomToBook(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 shadow-sm"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
