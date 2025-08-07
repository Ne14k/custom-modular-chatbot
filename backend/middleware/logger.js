class Logger {
  constructor(options = {}) {
    this.logLevel = options.logLevel || 'info';
    this.includeTimestamp = options.includeTimestamp !== false;
    this.includeConversationId = options.includeConversationId !== false;
  }

  async process(message, conversation) {
    const timestamp = this.includeTimestamp ? new Date().toISOString() : '';
    const conversationId = this.includeConversationId ? conversation.id : '';
    
    const logEntry = {
      timestamp,
      conversationId,
      message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      messageLength: message.length,
      historyLength: conversation.history.length
    };

    if (this.logLevel === 'debug' || this.logLevel === 'info') {
      console.log('message processed:', JSON.stringify(logEntry, null, 2));
    }

    return message;
  }
}

module.exports = Logger;