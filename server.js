require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { CustomModularChatbot, GeminiProvider } = require('./index');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const chatbot = new CustomModularChatbot({
  maxHistoryLength: 20,
  sessionTimeout: 30 * 60 * 1000
});

chatbot.addProvider('gemini', GeminiProvider, {
  apiKey: process.env.GEMINI_API_KEY,
  model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  maxTokens: parseInt(process.env.GEMINI_MAX_TOKENS) || 1000,
  temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7
});

chatbot.addProvider('default', GeminiProvider, {
  apiKey: process.env.GEMINI_API_KEY,
  model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
});

chatbot.on('messageReceived', (data) => {
  console.log(`📨 [${data.conversationId}] User: ${data.message}`);
});

chatbot.on('messageProcessed', (data) => {
  console.log(`🤖 [${data.conversationId}] Bot: ${data.response.substring(0, 100)}${data.response.length > 100 ? '...' : ''}`);
});

chatbot.on('error', (data) => {
  console.error(`❌ [${data.conversationId}] Error:`, data.error.message);
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationId = 'default', provider = 'gemini' } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }

    const result = await chatbot.sendMessage(conversationId, message, provider);
    
    res.json({
      success: result.success,
      response: result.response,
      conversationId: result.conversationId,
      error: result.error
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

app.get('/api/conversation/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    const conversation = chatbot.getConversation(conversationId);
    
    if (!conversation) {
      return res.status(404).json({ 
        success: false, 
        error: 'Conversation not found' 
      });
    }

    res.json({
      success: true,
      conversation: {
        id: conversation.id,
        history: conversation.history,
        messageCount: conversation.history.length
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

app.delete('/api/conversation/:conversationId', (req, res) => {
  try {
    const { conversationId } = req.params;
    chatbot.clearConversation(conversationId);
    
    res.json({
      success: true,
      message: 'Conversation cleared'
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

app.get('/api/conversations', (req, res) => {
  try {
    const activeConversations = chatbot.getActiveConversations();
    
    res.json({
      success: true,
      conversations: activeConversations,
      count: activeConversations.length
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

app.get('/', (req, res) => {
  const isApiRequest = req.headers.accept && req.headers.accept.includes('application/json');
  
  if (isApiRequest) {
    res.json({
      name: 'Custom Modular Chatbot API',
      version: '1.0.0',
      status: 'running',
      provider: 'Google Gemini',
      endpoints: {
        health: '/api/health',
        chat: 'POST /api/chat',
        conversation: 'GET /api/conversation/:id',
        conversations: 'GET /api/conversations'
      },
      frontend: 'http://localhost:5001',
      documentation: 'See README.md for full API documentation'
    });
  } else {
    res.send(`
      <html>
        <head>
          <title>Custom Modular Chatbot API</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; line-height: 1.6; }
            .header { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 20px; }
            .status { background: #2ecc71; color: white; padding: 10px 20px; border-radius: 5px; display: inline-block; }
            .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #3498db; }
            .method { background: #e74c3c; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px; }
            .link { color: #3498db; text-decoration: none; }
            .link:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🤖 Custom Modular Chatbot API</h1>
            <p>Powered by Google Gemini AI</p>
            <span class="status">✅ Server Running</span>
          </div>
          
          <h2>📡 Available Endpoints</h2>
          
          <div class="endpoint">
            <strong>Health Check</strong><br>
            <code>GET /api/health</code><br>
            <small>Check if the API server is running</small>
          </div>
          
          <div class="endpoint">
            <strong>Send Chat Message</strong><br>
            <code><span class="method">POST</span> /api/chat</code><br>
            <small>Send a message to the Gemini AI chatbot</small>
          </div>
          
          <div class="endpoint">
            <strong>Get Conversation</strong><br>
            <code>GET /api/conversation/:id</code><br>
            <small>Retrieve conversation history by ID</small>
          </div>
          
          <div class="endpoint">
            <strong>List Conversations</strong><br>
            <code>GET /api/conversations</code><br>
            <small>Get all active conversations</small>
          </div>
          
          <h2>🎨 Frontend Interface</h2>
          <p>
            <a href="http://localhost:5001" class="link">Open Chat Interface →</a><br>
            <small>Start the React frontend to interact with the chatbot through a beautiful UI</small>
          </p>
          
          <h2>🚀 Quick Start</h2>
          <div class="endpoint">
            <strong>Start Frontend:</strong><br>
            <code>cd frontend && PORT=5001 npm start</code>
          </div>
          
          <div class="endpoint">
            <strong>Test API:</strong><br>
            <code>curl -X POST http://localhost:3002/api/chat -H "Content-Type: application/json" -d '{"message":"Hello!"}'</code>
          </div>
          
          <p><small>📖 For full documentation, see README.md</small></p>
        </body>
      </html>
    `);
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    provider: 'Google Gemini'
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  chatbot.cleanup();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Chatbot API server running on http://localhost:${PORT}`);
  console.log(`🤖 Using Google Gemini AI`);
  console.log(`📡 Ready to receive chat requests at /api/chat`);
});