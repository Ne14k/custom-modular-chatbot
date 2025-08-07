const { CustomModularChatbot } = require('../index');
const { RateLimiter, ContentFilter, Logger } = require('../middleware');

// Mock provider for testing without API keys
class MockProvider {
  constructor(config) {
    this.config = config;
    this.name = 'mock';
  }

  async sendMessage(message, history = []) {
    return `Mock response to: ${message} (history length: ${history.length})`;
  }

  validateConfig() {
    // No validation needed for mock
  }

  getModelInfo() {
    return {
      name: this.name,
      models: ['mock-model-1']
    };
  }
}

async function runBasicTest() {
  console.log('running basic chatbot test...\n');

  try {
    // Create chatbot instance
    const chatbot = new CustomModularChatbot({
      maxHistoryLength: 5,
      sessionTimeout: 5 * 60 * 1000 // 5 minutes
    });

    // Add mock provider
    chatbot.addProvider('mock', MockProvider, {});
    chatbot.addProvider('default', MockProvider, {});

    // Add middleware
    chatbot.addMiddleware(new Logger({ logLevel: 'info' }));
    chatbot.addMiddleware(new ContentFilter({ 
      blockedWords: ['badword'], 
      maxLength: 100 
    }));
    chatbot.addMiddleware(new RateLimiter({ 
      maxRequests: 3, 
      windowMs: 10000 
    }));

    // Add event listeners
    let messageCount = 0;
    chatbot.on('messageProcessed', () => {
      messageCount++;
    });

    console.log('chatbot initialized successfully');

    // Test 1: Basic message
    console.log('\ntest 1: basic message');
    const response1 = await chatbot.sendMessage('test-conv', 'Hello world!');
    console.log('Response:', response1.response);
    console.log('Success:', response1.success);

    // Test 2: Conversation history
    console.log('\ntest 2: follow-up message');
    const response2 = await chatbot.sendMessage('test-conv', 'How are you?');
    console.log('Response:', response2.response);

    // Test 3: Get conversation
    console.log('\ntest 3: check conversation history');
    const conversation = chatbot.getConversation('test-conv');
    console.log('History length:', conversation.history.length);
    console.log('Messages processed:', messageCount);

    // Test 4: Content filter (should fail)
    console.log('\ntest 4: content filter test');
    const response4 = await chatbot.sendMessage('test-conv', 'This contains badword');
    if (response4.success) {
      console.log('content filter failed - should have blocked message');
    } else {
      console.log('content filter working:', response4.error);
    }

    // Test 5: Rate limiting
    console.log('\ntest 5: rate limiting test');
    // Send messages rapidly (should hit rate limit)
    await chatbot.sendMessage('rate-test', 'Message 1');
    await chatbot.sendMessage('rate-test', 'Message 2');
    await chatbot.sendMessage('rate-test', 'Message 3');
    const response5 = await chatbot.sendMessage('rate-test', 'Message 4'); // Should fail
    if (response5.success) {
      console.log('rate limiter failed - should have blocked message');
    } else {
      console.log('rate limiter working:', response5.error);
    }

    // Test 6: Multiple conversations
    console.log('\ntest 6: multiple conversations');
    await chatbot.sendMessage('conv1', 'Hello from conversation 1');
    await chatbot.sendMessage('conv2', 'Hello from conversation 2');
    
    const activeConversations = chatbot.getActiveConversations();
    console.log('Active conversations:', activeConversations.length);

    // Test 7: Clear conversation
    console.log('\ntest 7: clear conversation');
    chatbot.clearConversation('conv1');
    const conv1After = chatbot.getConversation('conv1');
    console.log('Conversation 1 after clear:', conv1After ? 'exists' : 'deleted');

    // Cleanup
    chatbot.cleanup();
    console.log('\nall tests completed successfully!');

  } catch (error) {
    console.error('test failed:', error.message);
    console.error(error.stack);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  runBasicTest();
}

module.exports = runBasicTest;