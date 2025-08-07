class RateLimiter {
  constructor(options = {}) {
    this.maxRequests = options.maxRequests || 10;
    this.windowMs = options.windowMs || 60 * 1000; // 1 minute
    this.requests = new Map();
  }

  async process(message, conversation) {
    const conversationId = conversation.id;
    const now = Date.now();
    
    if (!this.requests.has(conversationId)) {
      this.requests.set(conversationId, []);
    }

    const userRequests = this.requests.get(conversationId);
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(timestamp => 
      now - timestamp < this.windowMs
    );
    
    if (validRequests.length >= this.maxRequests) {
      throw new Error(`Rate limit exceeded. Maximum ${this.maxRequests} requests per ${this.windowMs / 1000} seconds.`);
    }

    // Add current request
    validRequests.push(now);
    this.requests.set(conversationId, validRequests);

    return message;
  }

  cleanup() {
    this.requests.clear();
  }
}

module.exports = RateLimiter;