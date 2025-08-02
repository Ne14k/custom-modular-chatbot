require('dotenv').config();
const { CustomModularChatbot, GeminiProvider } = require('./index');

async function example() {
  const chatbot = new CustomModularChatbot({
    maxHistoryLength: 20,
    sessionTimeout: 15 * 60 * 1000 // 15 minutes
  });

  // Add Gemini provider
  chatbot.addProvider('gemini', GeminiProvider, {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS) || 1000,
    temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7
  });

  // Set default provider
  chatbot.addProvider('default', GeminiProvider, {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  });

  // Add event listeners
  chatbot.on('messageReceived', (data) => {
    console.log(`received: ${data.message}`);
  });

  chatbot.on('messageProcessed', (data) => {
    console.log(`response: ${data.response}`);
  });

  chatbot.on('error', (data) => {
    console.error(`error: ${data.error}`);
  });

  // Example conversation
  try {
    console.log('starting chatbot example...\n');

    // Send message using default provider (Gemini)
    const response1 = await chatbot.sendMessage('conv1', 'Hello! What is artificial intelligence?');
    console.log(`Bot: ${response1.response}\n`);

    // Continue conversation
    const response2 = await chatbot.sendMessage('conv1', 'Can you explain it in simpler terms?');
    console.log(`Bot: ${response2.response}\n`);

    // Use Gemini provider directly
    const response3 = await chatbot.sendMessage('conv2', 'Write a haiku about coding', 'gemini');
    console.log(`Gemini: ${response3.response}\n`);

    // Show conversation history
    const conversation = chatbot.getConversation('conv1');
    console.log('conversation history:', conversation.history.length, 'messages');

    // Show active conversations
    console.log('active conversations:', chatbot.getActiveConversations().length);

  } catch (error) {
    console.error('Example failed:', error.message);
    console.log('\nMake sure your Google Gemini API key is set in the .env file');
  }

  // Cleanup
  chatbot.cleanup();
}

// Run example if this file is executed directly
if (require.main === module) {
  example();
}

module.exports = example;