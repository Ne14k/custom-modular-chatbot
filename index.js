const ChatbotEngine = require('./core/chatbot-engine');
const ConversationManager = require('./core/conversation-manager');
const MessageHandler = require('./core/message-handler');
const GeminiProvider = require('./providers/gemini-provider');
const CodeAssistantProvider = require('./providers/code-assistant-provider');
const CreativeWriterProvider = require('./providers/creative-writer-provider');

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

  // New method for task-based message sending
  async sendMessageWithTaskDetection(conversationId, message) {
    // Use task router to detect the appropriate provider
    const taskRouter = this.engine.middleware.find(m => m.constructor.name === 'TaskRouter');
    if (taskRouter) {
      const task = taskRouter.detectTask(message);
      const provider = taskRouter.getTaskProvider(task);
      return await this.sendMessage(conversationId, message, provider);
    }
    
    // Fallback to default provider
    return await this.sendMessage(conversationId, message, 'default');
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

  // New method to get available agents
  getAvailableAgents() {
    const agents = [];
    for (const [name, provider] of this.engine.providers) {
      const info = provider.getModelInfo();
      agents.push({
        name: name,
        capabilities: info.capabilities || [],
        description: info.description || `Agent: ${name}`
      });
    }
    return agents;
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
  GeminiProvider,
  CodeAssistantProvider,
  CreativeWriterProvider
};