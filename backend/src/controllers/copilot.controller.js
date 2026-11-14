import { processCopilotQuery } from '../services/copilotEngine.service.js';
import { db } from '../config/db.js';

// In-memory conversation store for high performance and offline fallback
let IN_MEMORY_CONVERSATIONS = [
  {
    id: 'conv-default-01',
    user_id: 'usr-student-01',
    title: 'Academic & Hackathon Planning',
    topic: 'academics',
    is_pinned: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

let IN_MEMORY_MESSAGES = [
  {
    id: 'msg-init-01',
    conversation_id: 'conv-default-01',
    sender: 'assistant',
    role: 'assistant',
    content: "Hello Alex! I am CampusFlow AI — your intelligent campus companion. How can I assist you today?",
    chips: [
      "What's my attendance percentage?",
      "What assignments are due this week?",
      "Find upcoming college hackathons",
      "What classes do I have today?"
    ],
    tool_calls: [],
    agent_trace: [],
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

export const copilotController = {
  /**
   * Main Chat Endpoint
   */
  async chat(req, res, next) {
    try {
      const { query, conversationId } = req.body;
      const user = req.user || {
        id: 'usr-student-01',
        name: 'Alex Rivera',
        full_name: 'Alex Rivera',
        role: 'student',
        reg_number: '21BCE1042',
        department: 'Computer Science & Engineering'
      };

      if (!query || typeof query !== 'string' || !query.trim()) {
        return res.status(400).json({ success: false, message: 'A non-empty query string is required' });
      }

      // Ensure valid conversation exists
      let convId = conversationId;
      let conv = IN_MEMORY_CONVERSATIONS.find(c => c.id === convId && c.user_id === user.id);
      if (!conv) {
        convId = 'conv-' + Date.now();
        conv = {
          id: convId,
          user_id: user.id,
          title: query.slice(0, 32) + (query.length > 32 ? '...' : ''),
          topic: 'general',
          is_pinned: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        IN_MEMORY_CONVERSATIONS.unshift(conv);
      } else {
        conv.updated_at = new Date().toISOString();
      }

      // Record User Message
      const userMessage = {
        id: 'msg-u-' + Date.now(),
        conversation_id: convId,
        sender: 'user',
        role: 'user',
        content: query.trim(),
        chips: [],
        tool_calls: [],
        agent_trace: [],
        created_at: new Date().toISOString()
      };
      IN_MEMORY_MESSAGES.push(userMessage);

      // Process query with Agentic Copilot Engine
      const copilotResponse = await processCopilotQuery({
        query: query.trim(),
        conversationHistory: IN_MEMORY_MESSAGES.filter(m => m.conversation_id === convId),
        user,
        liveStore: db.isPostgres() ? {} : (db.getStore ? db.getStore() : {})
      });

      // Record Assistant Message
      const botMessage = {
        id: 'msg-b-' + Date.now(),
        conversation_id: convId,
        sender: 'assistant',
        role: 'assistant',
        content: copilotResponse.answer,
        chips: copilotResponse.chips || [],
        tool_calls: copilotResponse.toolExecuted ? [copilotResponse.toolExecuted] : [],
        agent_trace: copilotResponse.agentTrace || [],
        rich_card: copilotResponse.richCard || null,
        created_at: new Date().toISOString()
      };
      IN_MEMORY_MESSAGES.push(botMessage);

      return res.status(200).json({
        success: true,
        data: {
          conversationId: convId,
          message: botMessage,
          answer: copilotResponse.answer,
          chips: copilotResponse.chips || [],
          agentTrace: copilotResponse.agentTrace || [],
          richCard: copilotResponse.richCard || null,
          toolExecuted: copilotResponse.toolExecuted || null
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * List Conversations
   */
  async getConversations(req, res, next) {
    try {
      const userId = req.user?.id || 'usr-student-01';
      const userConvs = IN_MEMORY_CONVERSATIONS.filter(c => c.user_id === userId);
      return res.status(200).json({
        success: true,
        data: userConvs
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get Message History of a Conversation
   */
  async getMessages(req, res, next) {
    try {
      const { conversationId } = req.params;
      const msgs = IN_MEMORY_MESSAGES.filter(m => m.conversation_id === conversationId);
      return res.status(200).json({
        success: true,
        data: msgs
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Create New Conversation
   */
  async createConversation(req, res, next) {
    try {
      const userId = req.user?.id || 'usr-student-01';
      const title = req.body.title || 'New Conversation';
      const newConv = {
        id: 'conv-' + Date.now(),
        user_id: userId,
        title,
        topic: 'general',
        is_pinned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      IN_MEMORY_CONVERSATIONS.unshift(newConv);

      // Add welcoming greeting
      const greeting = {
        id: 'msg-g-' + Date.now(),
        conversation_id: newConv.id,
        sender: 'assistant',
        role: 'assistant',
        content: `Hello ${req.user?.name || 'Alex'}! I'm CampusFlow AI, your intelligent campus companion. What would you like help with today?`,
        chips: [
          "What's my attendance percentage?",
          "What assignments are due this week?",
          "Find upcoming college hackathons",
          "Create my study timetable"
        ],
        tool_calls: [],
        agent_trace: [],
        created_at: new Date().toISOString()
      };
      IN_MEMORY_MESSAGES.push(greeting);

      return res.status(201).json({
        success: true,
        data: {
          conversation: newConv,
          initialMessages: [greeting]
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete Conversation
   */
  async deleteConversation(req, res, next) {
    try {
      const { conversationId } = req.params;
      IN_MEMORY_CONVERSATIONS = IN_MEMORY_CONVERSATIONS.filter(c => c.id !== conversationId);
      IN_MEMORY_MESSAGES = IN_MEMORY_MESSAGES.filter(m => m.conversation_id !== conversationId);
      return res.status(200).json({
        success: true,
        message: 'Conversation deleted successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Clear Messages in Conversation
   */
  async clearMessages(req, res, next) {
    try {
      const { conversationId } = req.params;
      IN_MEMORY_MESSAGES = IN_MEMORY_MESSAGES.filter(m => m.conversation_id !== conversationId);
      return res.status(200).json({
        success: true,
        message: 'Messages cleared successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Tool Action Execution (Sensitive Operations Confirmation)
   */
  async executeTool(req, res, next) {
    try {
      const { toolName, parameters } = req.body;
      const user = req.user || { id: 'usr-student-01', name: 'Alex Rivera' };

      if (toolName === 'register_for_event') {
        return res.status(200).json({
          success: true,
          data: {
            registrationId: 'reg-' + Date.now(),
            eventTitle: parameters.eventTitle || 'Apex InnoHacks 2026',
            status: 'confirmed',
            message: 'You have been successfully registered for the hackathon.'
          }
        });
      }

      if (toolName === 'toggle_quiet_mode') {
        const enabled = parameters.enabled ?? true;
        return res.status(200).json({
          success: true,
          data: {
            quietMode: enabled,
            message: enabled
              ? 'Exam Quiet Mode enabled. Non-critical notifications are muted.'
              : 'Exam Quiet Mode disabled. Standard notifications restored.'
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: { status: 'completed', parameters }
      });
    } catch (err) {
      next(err);
    }
  }
};

