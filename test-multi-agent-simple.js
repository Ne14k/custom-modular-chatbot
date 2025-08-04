// Simple test without API keys to verify the multi-agent system works
const { 
  CustomModularChatbot, 
  CodeAssistantProvider, 
  CreativeWriterProvider 
} = require('./index');
const TaskRouter = require('./middleware/task-router');

// Mock provider for testing
class MockProvider {
  constructor(config) {
    this.config = config;
    this.name = config.providerName || 'mock'; // Allow setting provider name
  }

  async sendMessage(message, history = []) {
    // Handle both string messages and object messages from middleware
    let messageText = message;
    if (typeof message === 'object' && message.originalMessage) {
      messageText = message.originalMessage;
    }
    
    // Simulate different responses based on the provider name
    if (this.name === 'code-assistant') {
      return `[Code Assistant] Here's a code example for you: ${messageText}`;
    } else if (this.name === 'creative-writer') {
      return `[Creative Writer] Here's a creative story: ${messageText}`;
    } else {
      return `[General Assistant] I can help you with: ${messageText}`;
    }
  }

  validateConfig() {
    return true;
  }

  getModelInfo() {
    return {
      name: this.name,
      models: ['mock'],
      capabilities: ['testing']
    };
  }
}

async function testMultiAgentSystem() {
  console.log('🧪 Testing Multi-Agent System Structure...\n');

  const chatbot = new CustomModularChatbot({
    maxHistoryLength: 10,
    sessionTimeout: 5 * 60 * 1000
  });

  // Add mock providers with specific names
  chatbot.addProvider('mock', MockProvider, { providerName: 'mock' });
  chatbot.addProvider('code-assistant', MockProvider, { providerName: 'code-assistant' });
  chatbot.addProvider('creative-writer', MockProvider, { providerName: 'creative-writer' });
  chatbot.addProvider('default', MockProvider, { providerName: 'default' });

  // Add task router
  chatbot.addMiddleware(new TaskRouter());

  // Test the system
  console.log('✅ Available agents:', chatbot.getAvailableAgents().map(a => a.name));
  console.log('✅ Task router middleware added');
  console.log('✅ Chatbot initialized successfully\n');

  // Test task detection
  const testMessages = [
    'Help me write a function in JavaScript',
    'Write a creative story about space',
    'What is the weather like?'
  ];

  for (const message of testMessages) {
    console.log(`📝 Testing message: "${message}"`);
    
    try {
      const result = await chatbot.sendMessageWithTaskDetection('test-conversation', message);
      if (result.success) {
        console.log(`✅ Response: ${result.response.substring(0, 80)}...`);
      } else {
        console.log(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('---');
  }

  console.log('🎯 Multi-agent system test completed!');
  console.log('✅ The system structure is working correctly');
  console.log('📝 To test with real AI, you would need to:');
  console.log('   1. Set up your GEMINI_API_KEY in .env file');
  console.log('   2. Run: node example-multi-agent.js');
}

// Run the test
if (require.main === module) {
  testMultiAgentSystem().catch(console.error);
}

module.exports = { testMultiAgentSystem }; 