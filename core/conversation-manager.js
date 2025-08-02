class ConversationManager {
  constructor(options = {}) {
    this.maxHistoryLength = options.maxHistoryLength || 50;
    this.sessionTimeout = options.sessionTimeout || 30 * 60 * 1000; // 30 minutes
    this.conversations = new Map();
    this.timers = new Map();
  }

  createConversation(id, metadata = {}) {
    const conversation = {
      id,
      history: [],
      metadata,
      createdAt: new Date(),
      lastActivity: new Date()
    };

    this.conversations.set(id, conversation);
    this.resetTimer(id);
    return conversation;
  }

  getConversation(id) {
    const conversation = this.conversations.get(id);
    if (conversation) {
      conversation.lastActivity = new Date();
      this.resetTimer(id);
    }
    return conversation;
  }

  addMessage(conversationId, role, content, metadata = {}) {
    let conversation = this.getConversation(conversationId);
    if (!conversation) {
      conversation = this.createConversation(conversationId);
    }

    const message = {
      role,
      content,
      timestamp: new Date(),
      ...metadata
    };

    conversation.history.push(message);

    if (conversation.history.length > this.maxHistoryLength) {
      conversation.history = conversation.history.slice(-this.maxHistoryLength);
    }

    return message;
  }

  resetTimer(conversationId) {
    if (this.timers.has(conversationId)) {
      clearTimeout(this.timers.get(conversationId));
    }

    const timer = setTimeout(() => {
      this.deleteConversation(conversationId);
    }, this.sessionTimeout);

    this.timers.set(conversationId, timer);
  }

  deleteConversation(id) {
    this.conversations.delete(id);
    if (this.timers.has(id)) {
      clearTimeout(this.timers.get(id));
      this.timers.delete(id);
    }
  }

  getActiveConversations() {
    return Array.from(this.conversations.values());
  }

  cleanup() {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.conversations.clear();
    this.timers.clear();
  }
}

module.exports = ConversationManager;