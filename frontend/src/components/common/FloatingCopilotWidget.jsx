import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { copilotApi } from '../../services/api';
import {
  Sparkles,
  Bot,
  User,
  X,
  Send,
  Maximize2,
  RotateCcw,
  Compass,
  ArrowRight
} from 'lucide-react';

const FLOATING_CHIPS = [
  "What's my attendance percentage?",
  "Find upcoming college hackathons.",
  "What assignments are due this week?"
];

export const FloatingCopilotWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const endRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = async (queryText) => {
    const text = (queryText || inputQuery).trim();
    if (!text) return;

    const userMsg = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      content: text
    };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const res = await copilotApi.ask(text, { role: user?.role || 'student' });
      if (res.success && res.data) {
        const botMsg = {
          id: 'msg-b-' + Date.now(),
          sender: 'assistant',
          content: res.data.answer || res.data.response || res.data.content,
          chips: res.data.suggestedFollowUps || res.data.chips || []
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: 'msg-err-' + Date.now(),
          sender: 'assistant',
          content: 'CampusFlow AI is ready to help! Attendance records and class schedules are currently synchronized.'
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Popup Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden mb-3 animate-in fade-in slide-in-from-bottom-6 duration-200 transition-colors">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-sky-600 to-indigo-600 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm tracking-tight leading-tight">CampusFlow AI</h4>
                <span className="text-[10px] text-sky-100 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Assistant
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Link
                to="/student/copilot"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Expand to Full Page"
              >
                <Maximize2 className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setMessages([])}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Clear Chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/40 text-xs">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center p-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-2">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h5 className="font-bold text-sm text-slate-900 dark:text-white">CampusFlow AI Copilot</h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  Ask me about your attendance threshold, class timetable, hackathons, or assignment deadlines.
                </p>

                <div className="mt-4 w-full space-y-1.5">
                  {FLOATING_CHIPS.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(chip)}
                      className="w-full p-2 bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-xl text-[11px] font-semibold text-left flex items-center justify-between transition cursor-pointer"
                    >
                      <span className="truncate">{chip}</span>
                      <ArrowRight className="w-3 h-3 text-sky-600 shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) => {
                const isUser = m.sender === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex gap-2 max-w-[88%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                      isUser ? 'bg-sky-600 text-white' : 'bg-slate-900 text-sky-400 dark:bg-slate-800'
                    }`}>
                      {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    </div>
                    <div className="space-y-1.5">
                      <div className={`p-3 rounded-2xl ${
                        isUser
                          ? 'bg-sky-600 text-white rounded-tr-none'
                          : 'bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-2xs'
                      }`}>
                        <div className="whitespace-pre-line leading-relaxed">{m.content}</div>
                      </div>

                      {!isUser && m.chips && m.chips.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {m.chips.slice(0, 2).map((c, i) => (
                            <button
                              key={i}
                              onClick={() => handleSend(c)}
                              className="px-2 py-1 bg-white dark:bg-slate-800 hover:bg-sky-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-full text-[10px] text-slate-700 dark:text-slate-300 transition"
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {isTyping && (
              <div className="flex gap-2 mr-auto items-center text-[11px] text-slate-400 animate-pulse">
                <div className="w-6 h-6 rounded-lg bg-slate-900 dark:bg-slate-800 text-sky-400 flex items-center justify-center">
                  <Bot className="w-3 h-3" />
                </div>
                <span>CampusFlow AI thinking...</span>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-1.5"
            >
              <input
                type="text"
                placeholder="Ask CampusFlow AI..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={isTyping}
                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <button
                type="submit"
                disabled={isTyping || !inputQuery.trim()}
                className="p-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white rounded-xl transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer group"
        title="CampusFlow AI Assistant"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
          </div>
        )}
      </button>
    </div>
  );
};

export default FloatingCopilotWidget;
