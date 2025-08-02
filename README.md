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

## 🤖 How It Works

1. **User types message** in React frontend
2. **Frontend sends request** to Express API (`/api/chat`)
3. **Express server** forwards to Gemini provider
4. **Gemini AI** processes the message and responds
5. **Response flows back** through the API to frontend
6. **User sees AI response** in the chat widget
