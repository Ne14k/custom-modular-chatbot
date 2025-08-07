class ContentFilter {
  constructor(options = {}) {
    this.blockedWords = options.blockedWords || [
      'spam', 'abuse', 'harmful'
    ];
    this.maxLength = options.maxLength || 1000;
    this.minLength = options.minLength || 1;
  }

  async process(message, conversation) {
    // Check message length
    if (message.length > this.maxLength) {
      throw new Error(`Message too long. Maximum ${this.maxLength} characters allowed.`);
    }

    if (message.length < this.minLength) {
      throw new Error(`Message too short. Minimum ${this.minLength} character required.`);
    }

    // Check for blocked words
    const lowerMessage = message.toLowerCase();
    for (const word of this.blockedWords) {
      if (lowerMessage.includes(word.toLowerCase())) {
        throw new Error(`Message contains inappropriate content: ${word}`);
      }
    }

    // Check for excessive repetition
    if (this.hasExcessiveRepetition(message)) {
      throw new Error('Message contains excessive repetition');
    }

    return message;
  }

  hasExcessiveRepetition(message) {
    const words = message.split(/\s+/);
    const wordCount = {};
    
    for (const word of words) {
      if (word.length > 2) { // Only check words longer than 2 characters
        wordCount[word.toLowerCase()] = (wordCount[word.toLowerCase()] || 0) + 1;
        if (wordCount[word.toLowerCase()] > Math.max(3, words.length * 0.3)) {
          return true;
        }
      }
    }
    
    return false;
  }
}

module.exports = ContentFilter;