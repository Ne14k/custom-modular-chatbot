const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const BaseProvider = require('./base-provider');

class GeminiProvider extends BaseProvider {
  constructor(config) {
    super(config);
    this.name = 'gemini';
    this.apiKey = config.apiKey;
    this.model = config.model || 'gemini-1.5-flash';
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
    this.validateConfig();
  }

  validateConfig() {
    if (!this.apiKey) {
      throw new Error('Google Gemini API key is required');
    }
  }

  async sendMessage(message, history = []) {
    try {
      const contents = this.formatForGemini(message, history);

      const response = await fetch(`${this.baseURL}/models/${this.model}:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            maxOutputTokens: this.config.maxTokens || 1000,
            temperature: this.config.temperature || 0.7,
            topP: 0.9,
            topK: 40
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorData}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('No response generated from Gemini');
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      throw error;
    }
  }

  formatForGemini(message, history) {
    const contents = [];
    
    // Add conversation history (last 10 messages to stay within context limits)
    const recentHistory = history.slice(-10);
    
    for (const msg of recentHistory) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }
    
    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });
    
    return contents;
  }

  getModelInfo() {
    return {
      name: this.name,
      models: [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-1.0-pro'
      ],
      currentModel: this.model,
      parameters: {
        maxTokens: this.config.maxTokens || 1000,
        temperature: this.config.temperature || 0.7
      }
    };
  }

  setModel(modelName) {
    this.model = modelName;
  }

  updateParameters(params) {
    if (params.maxTokens) this.config.maxTokens = params.maxTokens;
    if (params.temperature) this.config.temperature = params.temperature;
  }
}

module.exports = GeminiProvider;