import React, { useState, useEffect } from 'react';
import { noticeApi } from '../../services/api';
import {
  Bell,
  Sparkles,
  Calendar,
  CheckSquare,
  AlertTriangle,
  Clock,
  ArrowRight,
  FileText,
  Filter,
  CheckCircle2,
  Bookmark
} from 'lucide-react';

export const NoticeSummarizerPage = () => {
  const [notices, setNotices] = useState([]);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterAudience, setFilterAudience] = useState('all');

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const res = await noticeApi.list();
      if (res.success && res.data) {
        setNotices(res.data);
        if (res.data.length > 0 && !selectedNotice) {
          setSelectedNotice(res.data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = notices.filter(n => {
    if (filterAudience === 'all') return true;
    return n.target_audience === filterAudience;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-semibold text-xs tracking-wider uppercase mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Autonomous Text Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          Smart Notice Board & AI Digest
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          AI-condensed 3-bullet circular summaries, automated deadline extraction, and prioritized actionable checklists.
        </p>
      </div>

      {/* Two-Column Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Notices Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Circular Feed ({filtered.length})
            </h2>
            <select
              value={filterAudience}
              onChange={(e) => setFilterAudience(e.target.value)}
              className="text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none"
            >
              <option value="all">All Audiences</option>
              <option value="all_students">General Student Body</option>
              <option value="computer_science">Computer Science</option>
            </select>
          </div>

          <div className="space-y-3">
            {filtered.map((item) => {
              const isSelected = selectedNotice?.id === item.id;
              const isHigh = item.urgency === 'high';

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedNotice(item)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-sky-50/50 dark:bg-sky-950/30 border-sky-300 dark:border-sky-700 ring-1 ring-sky-300 dark:ring-sky-700 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      isHigh ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}>
                      {item.urgency} Urgency
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      {new Date(item.publish_date).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">{item.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.department}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Notice Detail with AI Breakdown */}
        <div className="lg:col-span-7">
          {selectedNotice ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-6">
              {/* Notice Meta */}
              <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    Official Circular #{selectedNotice.id}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">• {selectedNotice.department}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedNotice.title}</h2>
              </div>

              {/* AI 3-Bullet Executive Digest */}
              <div className="p-5 rounded-xl bg-slate-900 dark:bg-slate-950 text-white space-y-3 border border-slate-800">
                <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs tracking-wider uppercase">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Executive Digest</span>
                </div>
                <div className="text-sm text-slate-200 whitespace-pre-line leading-relaxed space-y-1">
                  {selectedNotice.summary}
                </div>
              </div>

              {/* Action Checklist */}
              {selectedNotice.action_items && (
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Required Student Action Items</span>
                  </h3>
                  <div className="space-y-2">
                    {selectedNotice.action_items.map((act, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="font-medium">{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Hard Deadlines */}
              {selectedNotice.deadlines && (
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Extracted Critical Deadlines</span>
                  </h3>
                  <div className="space-y-2">
                    {selectedNotice.deadlines.map((dl, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs">
                        <span className="font-semibold text-amber-900 dark:text-amber-300">{dl.item}</span>
                        <span className="font-mono font-medium text-amber-700 dark:text-amber-400">
                          {new Date(dl.date).toLocaleDateString()} ({new Date(dl.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
              Select a circular to generate AI executive breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
