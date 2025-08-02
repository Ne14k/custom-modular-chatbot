# Custom Modular Chatbot with Google Gemini

A modular chatbot framework powered by Google Gemini AI with a React frontend and Express backend.

## 🚀 Features

- **Google Gemini AI Integration** - Powered by Google's advanced Gemini model
- **React Frontend** - Beautiful chat widget with modern UI
- **Express API Backend** - RESTful API for chat interactions
- **Real-time Conversations** - Maintains conversation history
- **Modular Architecture** - Easy to extend with new providers
- **Loading States** - Visual feedback during AI responses
- **FAQ Support** - Built-in help system

## 🛠️ Setup

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Environment Variables

Your `.env` file is already configured with:
```
GEMINI_API_KEY=AIzaSyB9NEJoQvb6uzdBqSkXJq3lN5ZEul8pSys
GEMINI_MODEL=gemini-1.5-flash
GEMINI_MAX_TOKENS=1000
GEMINI_TEMPERATURE=0.7
```

### 3. Start the Application

**Option 1: Start both servers manually**
```bash
# Terminal 1: Start backend API server
npm run dev
# Runs on http://localhost:3002 with auto-reload

# Terminal 2: Start React frontend
cd frontend
PORT=3003 npm start
# Runs on http://localhost:3003
```

**Quick Access:**
- **API Documentation**: Visit `http://localhost:3002/` in your browser
- **Chat Interface**: Visit `http://localhost:3003/` after starting both servers

**Option 2: Test the chatbot programmatically**
```bash
npm run example
```

## 🌐 API Endpoints

- `POST /api/chat` - Send a message to the chatbot
- `GET /api/health` - Check server health
- `GET /api/conversation/:id` - Get conversation history
- `DELETE /api/conversation/:id` - Clear conversation
- `GET /api/conversations` - List active conversations

### Example API Usage

```javascript
// Send a message
const response = await fetch('http://localhost:3002/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Hello!',
    conversationId: 'my-conversation',
    provider: 'gemini'
  })
});

const data = await response.json();
console.log(data.response); // AI response
```

## 🎨 Frontend Usage

The React frontend provides a complete chat widget that:

1. **Connects to the API** - Automatically sends messages to the Gemini backend
2. **Shows loading states** - Visual feedback while AI responds
3. **Maintains conversations** - Keeps chat history
4. **FAQ Support** - Type "help" for quick questions
5. **Responsive design** - Works on desktop and mobile

## 🏗️ Architecture

```
/custom-modular-chatbot/
├── .env                    # Environment variables (Gemini API key)
├── server.js              # Express API server
├── index.js               # Main chatbot module
├── providers/
│   ├── base-provider.js   # Base provider class
│   └── gemini-provider.js # Google Gemini integration
├── core/                  # Core chatbot functionality
├── frontend/              # React chat widget
│   └── src/ChatWidget.tsx # Main chat component
└── middleware/            # Optional middleware
```

## 🤖 How It Works

1. **User types message** in React frontend
2. **Frontend sends request** to Express API (`/api/chat`)
3. **Express server** forwards to Gemini provider
4. **Gemini AI** processes the message and responds
5. **Response flows back** through the API to frontend
6. **User sees AI response** in the chat widget

## ✅ Current Status

- ✅ Google Gemini API fully integrated
- ✅ Express backend server running
- ✅ React frontend connected
- ✅ Real-time chat functionality
- ✅ Conversation history
- ✅ Error handling and loading states
- ✅ All components tested and working

## 🔧 Customization

You can easily customize:
- **AI Model**: Change `GEMINI_MODEL` in `.env`
- **Response length**: Adjust `GEMINI_MAX_TOKENS`
- **Creativity**: Modify `GEMINI_TEMPERATURE` (0.0-1.0)
- **UI styling**: Edit `/frontend/src/ChatWidget.tsx`
- **API endpoints**: Extend `/server.js`

Enjoy your fully integrated Gemini-powered chatbot! 🎉