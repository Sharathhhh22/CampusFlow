import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { classApi, sessionApi } from '../../services/api';
import { QrCode, ArrowLeft, ArrowRight, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

export const CreateSessionPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await classApi.list();
        if (res.success && res.data.length > 0) {
          setClasses(res.data);
          setSelectedClassId(res.data[0].id);
        }
      } catch (e) {
        setError(e.message || 'Error fetching classes');
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClassId) return;

    const fetchSubjects = async () => {
      try {
        const res = await classApi.getSubjects(selectedClassId);
        if (res.success && res.data.length > 0) {
          setSubjects(res.data);
          setSelectedSubjectId(res.data[0].id);
        } else {
          setSubjects([]);
          setSelectedSubjectId('');
        }
      } catch (e) {
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, [selectedClassId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClassId || !selectedSubjectId) {
      setError('Please select both a class and a subject');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await sessionApi.create({
        class_id: selectedClassId,
        subject_id: selectedSubjectId,
        duration_minutes: parseInt(durationMinutes, 10)
      });

      if (res.success && res.data?.session) {
        navigate(`/faculty/sessions/${res.data.session.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create attendance session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          to="/faculty/sessions"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sessions List
        </Link>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Attendance Session</h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate an independent cryptographic QR code with server-enforced duration and duplicate prevention.
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Class & Section
            </label>
            <select
              required
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} • {c.section} ({c.academic_year})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Subject
            </label>
            {subjects.length === 0 ? (
              <p className="text-xs text-slate-400 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                No subjects assigned to this class section yet.
              </p>
            ) : (
              <select
                required
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.subject_code})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Session Duration</span>
              <span className="text-sky-600 font-bold">{durationMinutes} Minutes</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[5, 10, 15, 30, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    durationMinutes === mins
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Server invalidates all scan submissions after this duration expires.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Security Guarantees
            </div>
            <p>
              Tokens are generated using cryptographically secure random bytes (`crypto.randomBytes(32)`), stored as SHA-256 hashes, and bounded by atomic single-check-in constraints.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || subjects.length === 0}
            className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition shadow-sm shadow-sky-200 flex items-center justify-center gap-2"
          >
            {loading ? 'Initializing Session...' : 'Generate & Project QR Code'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

