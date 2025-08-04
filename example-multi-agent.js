require('dotenv').config();
const { 
  CustomModularChatbot, 
  GeminiProvider, 
  CodeAssistantProvider, 
  CreativeWriterProvider 
} = require('./index');
const TaskRouter = require('./middleware/task-router');

async function multiAgentExample() {
  const chatbot = new CustomModularChatbot({
    maxHistoryLength: 20,
    sessionTimeout: 15 * 60 * 1000
  });

  // Add the base Gemini provider
  chatbot.addProvider('gemini', GeminiProvider, {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  });

  // Add specialized agents
  chatbot.addProvider('code-assistant', CodeAssistantProvider, {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  });

  chatbot.addProvider('creative-writer', CreativeWriterProvider, {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  });

  // Add task router middleware
  chatbot.addMiddleware(new TaskRouter());

  // Add event listeners
  chatbot.on('messageReceived', (data) => {
    console.log(`📨 [${data.conversationId}] User: ${data.message}`);
  });

  chatbot.on('messageProcessed', (data) => {
    console.log(`🤖 [${data.conversationId}] Agent Response: ${data.response.substring(0, 100)}...`);
  });

  // Example conversations with different agents
  const conversations = [
    {
      id: 'code-session',
      message: 'Help me write a function to calculate fibonacci numbers in JavaScript',
      expectedAgent: 'code-assistant'
    },
    {
      id: 'writing-session', 
      message: 'Write a short story about a robot learning to paint',
      expectedAgent: 'creative-writer'
    },
    {
      id: 'general-session',
      message: 'What is the weather like today?',
      expectedAgent: 'default'
    }
  ];

  console.log('🤖 Multi-Agent Chatbot Demo');
  console.log('Available agents:', chatbot.getAvailableAgents().map(a => a.name));
  console.log('---\n');

  for (const conv of conversations) {
    console.log(`\n🔄 Testing ${conv.expectedAgent} agent...`);
    console.log(`Message: "${conv.message}"`);
    
    try {
      const result = await chatbot.sendMessageWithTaskDetection(conv.id, conv.message);
      
      if (result.success) {
        console.log(`✅ Response from ${conv.expectedAgent}:`);
        console.log(result.response);
      } else {
        console.log(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      console.error(`❌ Exception: ${error.message}`);
    }
    
    console.log('---');
  }

  console.log('\n🎯 Demo completed!');
}

// Run the example
if (require.main === module) {
  multiAgentExample().catch(console.error);
}

module.exports = { multiAgentExample }; 