import React, { useState, useEffect } from 'react';
import { lostFoundApi } from '../../services/api';
import {
  Compass,
  Search,
  Plus,
  MapPin,
  Calendar,
  Sparkles,
  CheckCircle2,
  Tag,
  AlertCircle,
  Check,
  ShieldAlert
} from 'lucide-react';

export const LostFoundPage = () => {
  const [items, setItems] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedClaimItem, setSelectedClaimItem] = useState(null);
  const [claimProof, setClaimProof] = useState('');
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    type: 'lost',
    title: '',
    description: '',
    location: '',
    image_url: ''
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      const res = await lostFoundApi.list();
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.location) return;

    try {
      const res = await lostFoundApi.report(formData);
      if (res.success) {
        setToast({ msg: res.message, type: 'success' });
        setShowReportModal(false);
        setFormData({ type: 'lost', title: '', description: '', location: '', image_url: '' });
        loadItems();
      }
    } catch (err) {
      setToast({ msg: 'Failed to record report', type: 'error' });
    }
    setTimeout(() => setToast(null), 3500);
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClaimItem || !claimProof) return;

    try {
      const res = await lostFoundApi.claim(selectedClaimItem.id, claimProof);
      if (res.success) {
        setToast({ msg: res.message, type: 'success' });
        setSelectedClaimItem(null);
        setClaimProof('');
        loadItems();
      }
    } catch (err) {
      setToast({ msg: 'Failed to submit claim', type: 'error' });
    }
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = items.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location_found.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl font-medium text-sm text-white flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <Compass className="w-4 h-4" />
            <span>Campus Asset Recovery</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Campus Lost & Found AI Intelligence
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            AI-driven semantic image matching and automated notification radar for misplaced belongings across campus.
          </p>
        </div>
        <button
          onClick={() => setShowReportModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-amber-600 hover:bg-amber-500 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Report Item</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search items (e.g. ThinkPad charger, calculator, keys)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setFilterType('lost')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'lost' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Reported Lost
          </button>
          <button
            onClick={() => setFilterType('found')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'found' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Found & Available
          </button>
        </div>
      </div>

      {/* Item Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => {
          const isFound = item.type === 'found';

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="h-44 bg-slate-100 relative overflow-hidden">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${
                      isFound ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}>
                      {isFound ? 'Item Found' : 'Missing / Lost'}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900/80 text-white backdrop-blur-sm">
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{item.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>

                  <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{item.location_found}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(item.reported_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* AI Match Badge */}
                  {isFound && (
                    <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 flex items-center gap-2 text-xs text-amber-800">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>AI auto-crossreferenced with campus security lost reports.</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  Reported by {item.reported_by}
                </span>
                {isFound && item.status === 'available_for_claim' && (
                  <button
                    onClick={() => setSelectedClaimItem(item)}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                  >
                    Claim Item
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Report Campus Item</h2>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Report Category
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'lost' })}
                    className={`py-2 rounded-xl text-xs font-semibold border ${
                      formData.type === 'lost' ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    I Lost an Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'found' })}
                    className={`py-2 rounded-xl text-xs font-semibold border ${
                      formData.type === 'found' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    I Found an Item
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Item Name / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blue Dell Laptop Charger or Scientific Calculator"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Campus Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Block B, 2nd Floor Corridor or Library Desk 12"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Description & Unique Identifiers
                </label>
                <textarea
                  rows="3"
                  placeholder="Include scratches, stickers, brand name, serial digits or distinctive markings..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-amber-600 hover:bg-amber-500 shadow-sm"
                >
                  Submit Item Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Claim Modal */}
      {selectedClaimItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Claim {selectedClaimItem.title}
              </h2>
              <button onClick={() => setSelectedClaimItem(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <p className="text-xs text-slate-500">
                To prevent fraudulent claims, describe verifiable details not visible in photos (such as serial number, stickers, exact wallpaper, or purchase receipt).
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Proof of Ownership *
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. My student ID number is written on the bottom sticker..."
                  value={claimProof}
                  onChange={(e) => setClaimProof(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedClaimItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm"
                >
                  Submit Ownership Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
