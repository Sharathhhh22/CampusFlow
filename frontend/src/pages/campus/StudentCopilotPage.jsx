import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { copilotApi } from '../../services/api';
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
  BookOpen
} from 'lucide-react';

export const StudentCopilotPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 'msg-0',
      sender: 'assistant',
      text: `Hello ${user?.full_name?.split(' ')[0] || 'Alex'}! I am CampusFlow's AI Student Support Copilot. I have live access to your attendance records, timetable, assignment deadlines, and campus hackathons. How can I assist you today?`,
      chips: [
        'Check my attendance',
        'Show upcoming hackathons',
        'What classes do I have today?',
        'Do I have any pending assignments?'
      ]
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (queryText) => {
    const text = queryText || inputQuery;
    if (!text.trim()) return;

    const userMsg = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: text.trim()
    };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const res = await copilotApi.ask(text.trim(), {
        role: user?.role,
        reg_number: user?.reg_number || '21BCE1042'
      });

      if (res.success && res.data) {
        const botMsg = {
          id: 'msg-bot-' + Date.now(),
          sender: 'assistant',
          text: res.data.answer,
          chips: res.data.suggestedFollowUps || []
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: 'msg-err-' + Date.now(),
          sender: 'assistant',
          text: "I'm having trouble retrieving live student context right now. Please try again shortly.",
          chips: ['Try again']
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Autonomous Multi-Agent Copilot</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Student Academic & Operational Copilot
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Context-aware conversational assistance for attendance compliance, timetables, assignments, and campus events.
          </p>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[650px] overflow-hidden">
        {/* Chat Messages Log */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 bg-slate-50/30">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser ? 'bg-sky-600 text-white' : 'bg-slate-900 text-indigo-400'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-2.5">
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-sky-600 text-white rounded-tr-none shadow-sm'
                      : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none shadow-sm'
                  }`}>
                    <div className="whitespace-pre-line">{msg.text}</div>
                  </div>

                  {/* Suggestion Follow-Up Chips */}
                  {!isUser && msg.chips && msg.chips.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {msg.chips.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(chip)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 transition-all flex items-center gap-1.5 shadow-2xs"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-500" />
                          <span>{chip}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-indigo-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-2xl rounded-tl-none text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span>Copilot is reasoning over your academic records...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              placeholder="Ask anything (e.g. 'What's my attendance in CS-301?', 'When is my next hackathon?')..."
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isTyping}
              className={`p-3 rounded-xl transition-all ${
                inputQuery.trim() && !isTyping
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
