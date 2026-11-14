import React, { useState, useEffect } from 'react';
import { classroomApi } from '../../services/api';
import {
  Layers,
  Cpu,
  Zap,
  Thermometer,
  Users,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Building2,
  Tv,
  Wind,
  Video,
  Monitor
} from 'lucide-react';

export const CampusDigitalTwinPage = () => {
  const [twinData, setTwinData] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTwinState();
  }, []);

  const loadTwinState = async () => {
    try {
      setLoading(true);
      const res = await classroomApi.getDigitalTwinState();
      if (res.success && res.data) {
        setTwinData(res.data);
        if (res.data.classrooms?.length > 0 && !selectedRoom) {
          setSelectedRoom(res.data.classrooms[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = twinData?.classrooms?.filter(r => {
    if (selectedBuilding === 'all') return true;
    return r.building === selectedBuilding;
  }) || [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <Cpu className="w-4 h-4" />
            <span>Campus Digital Twin & IoT Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Institutional Spatial Twin & Resource Radar
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time sensory monitoring of classrooms, computing laboratories, ambient climate, and energy grid load.
          </p>
        </div>
        <button
          onClick={loadTwinState}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200/80 hover:bg-slate-50 shadow-sm transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Live Sensors</span>
        </button>
      </div>

      {/* High-Level Institutional Health Metrics */}
      {twinData && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Spatial Utilization</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{twinData.utilizationRate}%</span>
              <span className="text-xs text-slate-500">of capacity</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{twinData.occupiedRooms} / {twinData.totalRooms} Facilities Active</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Energy Grid Load</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{twinData.totalPowerLoadKw}</span>
              <span className="text-xs text-slate-500">kW active load</span>
            </div>
            <p className="text-[11px] text-emerald-600 mt-1 font-medium">Grid Nominal • Smart HVAC Auto-Balancing</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Climate</span>
              <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
                <Thermometer className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{twinData.avgTemperatureC}°C</span>
              <span className="text-xs text-slate-500">ambient mean</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">42 IoT Thermostats Online</p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Autonomous Agents</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">Resource Agent</span>
              <span className="text-xs text-emerald-600 font-semibold">Active</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">0 Scheduling Clashes Detected</p>
          </div>
        </div>
      )}

      {/* Building Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedBuilding('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedBuilding === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
          }`}
        >
          All Campus Zones
        </button>
        {twinData?.buildings?.map((b) => (
          <button
            key={b.name}
            onClick={() => setSelectedBuilding(b.name)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
              selectedBuilding === b.name
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{b.name}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600">
              {b.occupied}/{b.total}
            </span>
          </button>
        ))}
      </div>

      {/* Main Digital Twin Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Spatial Room Matrix */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Live Facility Grid ({filteredRooms.length})
            </h2>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Occupied</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Reserved</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRooms.map((room) => {
              const isSelected = selectedRoom?.id === room.id;
              const isOccupied = room.status === 'occupied';
              const isReserved = room.status === 'reserved';

              return (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(room)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  {/* Status Indicator Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                    isOccupied ? 'bg-amber-500' : isReserved ? 'bg-purple-500' : 'bg-emerald-500'
                  }`} />

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {room.code}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          isOccupied
                            ? 'bg-amber-50 text-amber-700'
                            : isReserved
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {room.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 mt-2">{room.name}</h3>
                      <p className="text-xs text-slate-500">{room.building} • Floor {room.floor}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-semibold text-slate-700">{room.temperature_c}°C</p>
                      <p className="text-[10px] text-slate-400">{room.power_load_kw} kW</p>
                    </div>
                  </div>

                  {isOccupied && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <p className="font-medium text-slate-900 truncate">{room.current_course}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">{room.current_faculty} • {room.current_occupancy} students</p>
                    </div>
                  )}

                  {/* Hardware Capability Tags */}
                  <div className="mt-3.5 flex items-center gap-3 text-slate-400 text-xs">
                    {room.has_projector && <Tv className="w-3.5 h-3.5 text-slate-600" title="Laser Projector" />}
                    {room.has_ac && <Wind className="w-3.5 h-3.5 text-slate-600" title="Climate Controlled AC" />}
                    {room.has_video_conferencing && <Video className="w-3.5 h-3.5 text-slate-600" title="HD Telepresence" />}
                    {room.has_smartboard && <Monitor className="w-3.5 h-3.5 text-slate-600" title="Smart Interactive Board" />}
                    <span className="text-[11px] text-slate-500 ml-auto font-medium">{room.capacity} seats</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Room Deep Telemetry Drawer */}
        <div className="lg:col-span-4 space-y-6">
          {selectedRoom ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
              <div className="pb-4 border-b border-slate-100">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-600">
                  Spatial Node Telemetry
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedRoom.name}</h3>
                <p className="text-xs text-slate-500">{selectedRoom.building}</p>
              </div>

              {/* Hardware Inventory */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  Connected IoT Peripherals
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-600">Laser Display Unit</span>
                    <span className="font-semibold text-emerald-600">Online (4K 60Hz)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-600">Variable Refrigerant HVAC</span>
                    <span className="font-semibold text-slate-900">{selectedRoom.temperature_c}°C Target</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-600">Smart Power Relay</span>
                    <span className="font-semibold text-slate-900">{selectedRoom.power_load_kw} kW Active</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <span className="text-slate-600">Automated QR Beacon</span>
                    <span className="font-semibold text-indigo-600">Ready for Session</span>
                  </div>
                </div>
              </div>

              {/* Resource Agent Recommendation */}
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs">
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Campus Resource Agent Analysis</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedRoom.status === 'available'
                    ? `This room is available with 0 overlapping reservations until 4:00 PM. High power efficiency and full audiovisual setup make it ideal for workshops or makeup lectures.`
                    : `Currently in operational session with ${selectedRoom.current_faculty}. Scheduled to conclude in 45 minutes.`}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/80 text-slate-400 text-xs">
              Select any classroom to view real-time sensory data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
