class ChatbotEngine {
  constructor(config) {
    this.config = config;
    this.providers = new Map();
    this.conversations = new Map();
    this.middleware = [];
  }

  registerProvider(name, provider) {
    this.providers.set(name, provider);
  }

  addMiddleware(middleware) {
    this.middleware.push(middleware);
  }

  async processMessage(conversationId, message, providerName = 'default') {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Provider '${providerName}' not found`);
    }

    let conversation = this.conversations.get(conversationId) || {
      id: conversationId,
      history: []
    };

    conversation.history.push({ role: 'user', content: message });

    for (const middleware of this.middleware) {
      message = await middleware.process(message, conversation);
    }

    const response = await provider.sendMessage(message, conversation.history);
    conversation.history.push({ role: 'assistant', content: response });
    
    this.conversations.set(conversationId, conversation);
    
    return response;
  }

  getConversation(conversationId) {
    return this.conversations.get(conversationId);
  }

  clearConversation(conversationId) {
    this.conversations.delete(conversationId);
  }
}

module.exports = ChatbotEngine;