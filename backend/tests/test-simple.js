require('dotenv').config();
const { CustomModularChatbot, GeminiProvider } = require('../index');

async function simpleTest() {
  console.log('🤖 Testing Google Gemini Integration');
  console.log('===================================');

  const chatbot = new CustomModularChatbot();

  // Add Gemini provider
  chatbot.addProvider('gemini', GeminiProvider, {
    apiKey: process.env.GEMINI_API_KEY,
    model: 'gemini-1.5-flash',
    maxTokens: 50,
    temperature: 0.3
  });

  try {
    console.log('📤 Sending test message...');
    const result = await chatbot.sendMessage('test-conv', 'Say hello in 3 words', 'gemini');
    
    if (result.success) {
      console.log('✅ Success!');
      console.log(`🤖 Response: ${result.response}`);
    } else {
      console.log('❌ Failed:', result.error);
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message);
    
    if (error.message.includes('429')) {
      console.log('⏳ Rate limit hit - this means the API key is working!');
      console.log('✅ Gemini integration is properly configured');
    } else if (error.message.includes('401') || error.message.includes('403')) {
      console.log('🔑 API key issue - please check your Google Gemini API key');
    }
  }

  chatbot.cleanup();
}

simpleTest();