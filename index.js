const ChatbotEngine = require('./core/chatbot-engine');
const ConversationManager = require('./core/conversation-manager');
const MessageHandler = require('./core/message-handler');
const GeminiProvider = require('./providers/gemini-provider');

class CustomModularChatbot {
  constructor(config = {}) {
    this.conversationManager = new ConversationManager({
      maxHistoryLength: config.maxHistoryLength || 50,
      sessionTimeout: config.sessionTimeout || 30 * 60 * 1000
    });

    this.engine = new ChatbotEngine(config);
    this.messageHandler = new MessageHandler(this.engine, this.conversationManager);
    
    this.setupEventListeners();
  }

  addProvider(name, providerClass, config) {
    const provider = new providerClass(config);
    this.engine.registerProvider(name, provider);
    return this;
  }

  addMiddleware(middleware) {
    this.engine.addMiddleware(middleware);
    return this;
  }

  async sendMessage(conversationId, message, provider = 'default') {
    return await this.messageHandler.handleMessage({
      conversationId,
      message,
      provider
    });
  }

  getConversation(conversationId) {
    return this.conversationManager.getConversation(conversationId);
  }

  clearConversation(conversationId) {
    this.conversationManager.deleteConversation(conversationId);
  }

  getActiveConversations() {
    return this.conversationManager.getActiveConversations();
  }

  on(event, callback) {
    this.messageHandler.on(event, callback);
    return this;
  }

  off(event, callback) {
    this.messageHandler.off(event, callback);
    return this;
  }

  setupEventListeners() {
    this.messageHandler.on('error', (data) => {
      console.error(`Error in conversation ${data.conversationId}:`, data.error);
    });

    this.messageHandler.on('messageReceived', (data) => {
      console.log(`Message received for conversation ${data.conversationId}: ${data.message}`);
    });

    this.messageHandler.on('messageProcessed', (data) => {
      console.log(`Message processed for conversation ${data.conversationId}`);
    });
  }

  cleanup() {
    this.conversationManager.cleanup();
  }
}

module.exports = {
  CustomModularChatbot,
  ChatbotEngine,
  ConversationManager,
  MessageHandler,
  GeminiProvider
};