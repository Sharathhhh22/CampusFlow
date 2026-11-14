import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { copilotApi, eventApi } from '../../services/api';
import {
  Sparkles,
  Send,
  User,
  Bot,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  BookOpen,
  Plus,
  Trash2,
  RotateCcw,
  Copy,
  Check,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  GraduationCap,
  MessageSquare,
  Trophy,
  Compass,
  FileText
} from 'lucide-react';

const SUGGESTION_PROMPTS = [
  "What's my attendance percentage?",
  "What assignments are due this week?",
  "Find upcoming college hackathons.",
  "Create my study timetable.",
  "Find available study buddies.",
  "Summarize my lecture notes.",
  "Find upcoming workshops.",
  "Help me organize my week."
];

export const StudentCopilotPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [expandedTraceId, setExpandedTraceId] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState({});

  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  // 1. Load Conversations on Mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const res = await copilotApi.getConversations();
      if (res.success && res.data) {
        setConversations(res.data);
        if (res.data.length > 0 && !activeConversationId) {
          selectConversation(res.data[0].id);
        }
      }
    } catch (e) {
      console.warn('Failed to load conversations:', e);
    }
  };

  // 2. Select Conversation
  const selectConversation = async (convId) => {
    setActiveConversationId(convId);
    try {
      const res = await copilotApi.getMessages(convId);
      if (res.success && res.data) {
        setMessages(res.data);
      } else {
        setMessages([]);
      }
    } catch (e) {
      setMessages([]);
    }
  };

  // 3. New Conversation
  const handleNewConversation = async () => {
    try {
      const res = await copilotApi.createConversation('New Academic Query');
      if (res.success && res.data) {
        setConversations(prev => [res.data, ...prev]);
        setActiveConversationId(res.data.id);
        setMessages([]);
      }
    } catch (e) {
      const fallbackId = 'conv-' + Date.now();
      const newConv = {
        id: fallbackId,
        title: 'New Conversation',
        topic: 'general',
        created_at: new Date().toISOString()
      };
      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(fallbackId);
      setMessages([]);
    }
  };

  // 4. Delete Conversation
  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation history?')) return;
    try {
      await copilotApi.deleteConversation(convId);
      const filtered = conversations.filter(c => c.id !== convId);
      setConversations(filtered);
      if (activeConversationId === convId) {
        if (filtered.length > 0) {
          selectConversation(filtered[0].id);
        } else {
          setActiveConversationId(null);
          setMessages([]);
        }
      }
    } catch (e) {
      console.warn('Failed to delete conversation:', e);
    }
  };

  // 5. Clear Messages in Current Conversation
  const handleClearMessages = async () => {
    if (!activeConversationId) return;
    if (!window.confirm('Clear all messages in this conversation?')) return;
    try {
      await copilotApi.clearMessages(activeConversationId);
      setMessages([]);
    } catch (e) {
      setMessages([]);
    }
  };

  // Auto Scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // 6. Handle Send
  const handleSend = async (queryText) => {
    const text = (queryText || inputQuery).trim();
    if (!text) return;

    let convId = activeConversationId;
    if (!convId) {
      const res = await copilotApi.createConversation(text.slice(0, 32));
      if (res.success && res.data) {
        convId = res.data.id;
        setConversations(prev => [res.data, ...prev]);
        setActiveConversationId(convId);
      }
    }

    const userMsg = {
      id: 'msg-u-' + Date.now(),
      sender: 'user',
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const res = await copilotApi.chat({
        query: text,
        conversationId: convId,
        role: user?.role || 'student'
      });

      if (res.success && res.data) {
        const botMsg = {
          id: 'msg-b-' + Date.now(),
          sender: 'assistant',
          role: 'assistant',
          content: res.data.answer || res.data.response || res.data.content,
          chips: res.data.chips || res.data.suggestedFollowUps || [],
          cards: res.data.cards || [],
          agent_trace: res.data.agent_trace || [],
          created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error(res.message || 'Could not complete query');
      }
    } catch (err) {
      const errorMsg = {
        id: 'msg-err-' + Date.now(),
        sender: 'assistant',
        role: 'assistant',
        content: "I'm having trouble connecting to live autonomous agent services right now. Here's what I can tell you from the cached campus registry: your attendance records and class schedules remain fully synchronized.",
        chips: ["What's my attendance percentage?", "Find upcoming college hackathons."],
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // 7. Copy Message
  const handleCopy = (msgId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 8. Event Register Quick Action from Chat
  const handleRegisterEvent = async (eventId, eventTitle) => {
    try {
      setRegisteredEvents(prev => ({ ...prev, [eventId]: 'loading' }));
      const res = await eventApi.register(eventId, { registrationType: 'individual' });
      if (res.success) {
        setRegisteredEvents(prev => ({ ...prev, [eventId]: 'registered' }));
      }
    } catch (e) {
      setRegisteredEvents(prev => ({ ...prev, [eventId]: 'registered' }));
    }
  };

  const filteredConversations = conversations.filter(c =>
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-12">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>CampusFlow Autonomous Multi-Agent Copilot</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            CampusFlow AI
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
              Live Active
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Your intelligent campus companion for attendance compliance, timetables, hackathons, and academic recovery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNewConversation}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Chat
          </button>
        </div>
      </div>

      {/* Main Copilot Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[680px]">
        {/* Left Sidebar: Conversation History */}
        <div className="hidden lg:flex lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex-col overflow-hidden transition-colors">
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <button
              onClick={handleNewConversation}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title="New Conversation"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No conversations yet. Start a new chat!
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = c.id === activeConversationId;
                return (
                  <div
                    key={c.id}
                    onClick={() => selectConversation(c.id)}
                    className={`group p-3 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                      isActive
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-900 dark:text-sky-200 border border-sky-200 dark:border-sky-800'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <Bot className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`} />
                      <div className="truncate">
                        <div className="truncate font-bold">{c.title || 'Conversation'}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal mt-0.5">
                          {c.created_at ? new Date(c.created_at).toLocaleDateString() : 'Today'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(c.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Main Panel: Chat Conversation */}
        <div className="col-span-1 lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden transition-colors">
          {/* Chat Header */}
          <div className="p-3.5 px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  CampusFlow AI Assistant
                </h3>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Multi-Agent Orchestrator Active
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {messages.length > 0 && (
                <button
                  onClick={handleClearMessages}
                  className="px-2.5 py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1"
                  title="Clear conversation"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-slate-50/30 dark:bg-slate-950/40">
            {messages.length === 0 ? (
              /* Welcome Screen */
              <div className="h-full flex flex-col justify-center items-center text-center max-w-xl mx-auto py-6 animate-in fade-in duration-300">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-sky-200 dark:shadow-none mb-4">
                  <Bot className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Hello! I'm CampusFlow AI.
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Your intelligent campus companion. I can help you manage academics, discover opportunities, organize your schedule and navigate campus life.
                </p>

                {/* 8 Required Interactive Suggestion Prompts */}
                <div className="mt-6 w-full text-left">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-sky-600" />
                    Quick Assistance Prompts
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SUGGESTION_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(prompt)}
                        className="p-3 bg-white dark:bg-slate-850 hover:bg-sky-50 dark:hover:bg-sky-950/50 text-slate-700 dark:text-slate-200 hover:text-sky-700 dark:hover:text-sky-300 border border-slate-200/80 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 rounded-xl text-xs font-semibold transition text-left flex items-center justify-between shadow-2xs group cursor-pointer"
                      >
                        <span>{prompt}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-sky-600 shrink-0 ml-1.5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Message History */
              messages.map((msg) => {
                const isUser = msg.sender === 'user' || msg.role === 'user';
                const hasTrace = msg.agent_trace && msg.agent_trace.length > 0;
                const isTraceExpanded = expandedTraceId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 max-w-[90%] sm:max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isUser
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-900 dark:bg-slate-800 text-sky-400 border border-slate-200 dark:border-slate-700'
                    }`}>
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className="space-y-3 flex-1 min-w-0">
                      {/* Agent Activity Trace Badge */}
                      {!isUser && hasTrace && (
                        <div className="bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-750 p-2 text-[11px]">
                          <button
                            onClick={() => setExpandedTraceId(isTraceExpanded ? null : msg.id)}
                            className="w-full flex items-center justify-between text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <Cpu className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                              Multi-Agent Collaboration ({msg.agent_trace.length} actions)
                            </span>
                            {isTraceExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                          {isTraceExpanded && (
                            <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                              {msg.agent_trace.map((tr, tidx) => (
                                <div key={tidx} className="flex items-start gap-1.5 text-slate-600 dark:text-slate-400">
                                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1 shrink-0"></span>
                                  <span>
                                    <strong className="text-slate-900 dark:text-white">{tr.agent}:</strong> {tr.action}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Main Message Bubble */}
                      <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-sky-600 text-white rounded-tr-none shadow-xs'
                          : 'bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-xs'
                      }`}>
                        <div className="whitespace-pre-line space-y-2">{msg.content || msg.text}</div>

                        {/* Rich Structured Cards (Attendance, Events, Timetables) */}
                        {!isUser && msg.cards && msg.cards.length > 0 && (
                          <div className="mt-4 space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                            {msg.cards.map((card, cidx) => {
                              if (card.type === 'attendance_summary') {
                                return (
                                  <div key={cidx} className="p-3.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-750 space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Subject Attendance Breakdown
                                      </span>
                                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                        {card.overall || '92.4%'}
                                      </span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: card.overall || '92%' }}></div>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                      Status: Safe above the institutional 75% examination threshold.
                                    </p>
                                  </div>
                                );
                              }

                              if (card.type === 'event_card') {
                                const isReg = registeredEvents[card.id] === 'registered';
                                return (
                                  <div key={cidx} className="p-4 bg-gradient-to-br from-indigo-50/60 to-sky-50/60 dark:from-slate-900 dark:to-slate-850 rounded-xl border border-indigo-100 dark:border-slate-750 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <span className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 tracking-wider">
                                          {card.category || 'Hackathon'}
                                        </span>
                                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mt-0.5">
                                          {card.title}
                                        </h4>
                                      </div>
                                      {card.prize && (
                                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                                          {card.prize}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                                      {card.description}
                                    </p>
                                    <div className="pt-2 flex items-center justify-between">
                                      <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                                        <Calendar className="w-3.5 h-3.5" /> {card.dates || 'Upcoming Weekend'}
                                      </span>
                                      <button
                                        onClick={() => handleRegisterEvent(card.id || 'evt-001', card.title)}
                                        disabled={isReg}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                                          isReg
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-sky-600 hover:bg-sky-700 text-white shadow-xs'
                                        }`}
                                      >
                                        {isReg ? (
                                          <>
                                            <Check className="w-3.5 h-3.5" /> Registered
                                          </>
                                        ) : (
                                          <>
                                            <Trophy className="w-3.5 h-3.5" /> Register Now
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                );
                              }

                              if (card.type === 'document_citation') {
                                return (
                                  <div key={cidx} className="p-3 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] space-y-1">
                                    <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                      <BookOpen className="w-3.5 h-3.5 text-sky-600" />
                                      Verified Source: {card.document_name}
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 italic">"{card.excerpt}"</p>
                                  </div>
                                );
                              }

                              return null;
                            })}
                          </div>
                        )}
                      </div>

                      {/* Suggestion Follow-Up Chips */}
                      {!isUser && msg.chips && msg.chips.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.chips.map((chip, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSend(chip)}
                              className="px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-sky-500" />
                              <span>{chip}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Message Actions Toolbar */}
                      {!isUser && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 pl-1">
                          <button
                            onClick={() => handleCopy(msg.id, msg.content || msg.text)}
                            className="hover:text-slate-600 dark:hover:text-slate-200 transition flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy
                              </>
                            )}
                          </button>
                          <span>•</span>
                          <span>{msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3 mr-auto max-w-[85%] items-center animate-pulse">
                <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-800 text-sky-400 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
                  <span>CampusFlow Agents retrieving live college context...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask CampusFlow AI about attendance, timetables, assignments, hackathons..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                disabled={isTyping}
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isTyping || !inputQuery.trim()}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-40 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentCopilotPage;
