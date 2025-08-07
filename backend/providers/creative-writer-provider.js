const BaseProvider = require('./base-provider');

class CreativeWriterProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.name = 'creative-writer';
    this.validateConfig();
  }

  validateConfig() {
    if (!this.config.apiKey) {
      throw new Error('API key is required for Creative Writer');
    }
  }

  async sendMessage(message, history = []) {
    // Add creative writing-specific system prompt
    const systemPrompt = `You are a specialized creative writing assistant. Your role is to:
    - Help with story development and plot creation
    - Provide writing prompts and creative ideas
    - Assist with character development and dialogue
    - Help with different writing styles and genres
    - Provide constructive feedback on writing
    - Help with poetry, fiction, and creative non-fiction
    
    Always encourage creativity and provide inspiring, engaging responses.`;

    // Format the message with creative writing context
    const enhancedMessage = this.formatCreativeMessage(message, systemPrompt);
    
    // Use the parent provider (like Gemini) to send the message
    return await super.sendMessage(enhancedMessage, history);
  }

  formatCreativeMessage(message, systemPrompt) {
    return `${systemPrompt}\n\nUser request: ${message}\n\nPlease provide a creative, inspiring response.`;
  }

  getModelInfo() {
    return {
      name: this.name,
      models: ['creative-writer'],
      capabilities: ['story-writing', 'poetry', 'character-development', 'creative-prompts']
    };
  }
}

module.exports = CreativeWriterProvider; 