const BaseProvider = require('./base-provider');

class CodeAssistantProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.name = 'code-assistant';
    this.validateConfig();
  }

  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('API key is required for Code Assistant');
    }
  }

  async sendMessage(message, history = []) {
    // Add code-specific system prompt
    const systemPrompt = `You are a specialized code assistant. Your role is to:
    - Help with programming questions and debugging
    - Provide code examples and explanations
    - Suggest best practices and optimizations
    - Help with specific programming languages and frameworks
    - Format code responses with proper syntax highlighting
    
    Always provide practical, executable code examples when relevant.`;

    // Format the message with code-specific context
    const enhancedMessage = this.formatCodeMessage(message, systemPrompt);
    
    // Use the parent provider (like Gemini) to send the message
    return await super.sendMessage(enhancedMessage, history);
  }

  formatCodeMessage(message, systemPrompt) {
    return `${systemPrompt}\n\nUser request: ${message}\n\nPlease provide a helpful code-focused response.`;
  }

  getModelInfo() {
    return {
      name: this.name,
      models: ['code-assistant'],
      capabilities: ['code-generation', 'debugging', 'best-practices']
    };
  }
}

module.exports = CodeAssistantProvider; 