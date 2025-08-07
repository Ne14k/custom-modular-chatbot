class BaseProvider {
  constructor(config) {
    this.config = config;
    this.name = 'base';
  }

  async sendMessage(message, history = []) {
    throw new Error('sendMessage method must be implemented by provider');
  }

  formatHistory(history) {
    return history.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  validateConfig() {
    throw new Error('validateConfig method must be implemented by provider');
  }

  getModelInfo() {
    return {
      name: this.name,
      models: []
    };
  }
}

module.exports = BaseProvider;