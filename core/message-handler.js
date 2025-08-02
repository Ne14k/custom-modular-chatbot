class MessageHandler {
  constructor(engine, conversationManager) {
    this.engine = engine;
    this.conversationManager = conversationManager;
    this.eventListeners = new Map();
  }

  async handleMessage(data) {
    const { conversationId, message, provider = 'default', metadata = {} } = data;

    try {
      this.emit('messageReceived', { conversationId, message, metadata });

      this.conversationManager.addMessage(conversationId, 'user', message, metadata);

      const response = await this.engine.processMessage(conversationId, message, provider);

      this.conversationManager.addMessage(conversationId, 'assistant', response);

      this.emit('messageProcessed', { conversationId, message, response });

      return {
        success: true,
        response,
        conversationId
      };
    } catch (error) {
      this.emit('error', { conversationId, error, message });
      
      return {
        success: false,
        error: error.message,
        conversationId
      };
    }
  }

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  emit(event, data) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  off(event, callback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
}

module.exports = MessageHandler;