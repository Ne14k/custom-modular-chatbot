import React, { useState } from 'react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp?: Date;
}

interface ApiResponse {
  success: boolean;
  response?: string;
  error?: string;
  conversationId?: string;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hi! I'm your AI assistant powered by Google Gemini. How can I help you today?", sender: 'bot', timestamp: new Date() }
  ]);
  const [inputText, setInputText] = useState('');
  const [showFAQButtons, setShowFAQButtons] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId] = useState(() => `conversation_${Date.now()}`);
  const [apiUrl] = useState('http://localhost:3002');

  const sendMessageToAPI = async (message: string): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationId,
          provider: 'gemini'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      return {
        success: false,
        error: 'Failed to connect to AI service. Please try again.'
      };
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputText;
    setInputText('');
    setIsLoading(true);
    setShowFAQButtons(false);

    // Check if user typed any variation of "help" (case insensitive, whole word)
    const helpRegex = /\bhelp\b/i;
    if (helpRegex.test(currentMessage)) {
      setShowFAQButtons(true);
      setIsLoading(false);
      
      setTimeout(() => {
        const botMessage: Message = {
          id: Date.now() + 1,
          text: "Here are some common questions I can help you with:",
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }, 1000);
    } else {
      // Send to Gemini API
      const apiResponse = await sendMessageToAPI(currentMessage);
      setIsLoading(false);

      const botMessage: Message = {
        id: Date.now() + 1,
        text: apiResponse.success 
          ? (apiResponse.response || 'I received your message but had trouble responding.')
          : (apiResponse.error || 'Sorry, I encountered an error. Please try again.'),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    }
  };

  const handleFAQClick = async (topic: string) => {
    const userMessage: Message = {
      id: Date.now(),
      text: topic,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setShowFAQButtons(false);
    setIsLoading(true);

    // Send FAQ question to Gemini
    const apiResponse = await sendMessageToAPI(`Please provide information about: ${topic}`);
    setIsLoading(false);

    const botMessage: Message = {
      id: Date.now() + 1,
      text: apiResponse.success 
        ? (apiResponse.response || 'I received your question but had trouble responding.')
        : (apiResponse.error || 'Sorry, I encountered an error. Please try again.'),
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div 
      className="chat-widget-container"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000
      }}>
      {/* Chat Window */}
      {isOpen && (
        <div style={{
          width: 'min(400px, calc(100vw - 40px))',
          height: 'min(500px, calc(100vh - 140px))',
          backgroundColor: 'white',
          borderRadius: '15px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e5e5e5',
          marginBottom: '10px',
          display: 'flex',
          flexDirection: 'column',
          animation: 'expandFromCircle 0.15s ease-out',
          transformOrigin: 'bottom right'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #e5e5e5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>AI Assistant</h3>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                margin: 0 
              }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#10b981',
                  borderRadius: '50%'
                }}></div>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>Online</p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '75%',
                    padding: '12px 16px',
                    borderRadius: '18px',
                    fontSize: '15px',
                    backgroundColor: message.sender === 'user' ? '#007bff' : '#f1f1f1',
                    color: message.sender === 'user' ? 'white' : 'black',
                    lineHeight: '1.4',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {message.text}
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start'
              }}>
                <div style={{
                  maxWidth: '75%',
                  padding: '12px 16px',
                  borderRadius: '18px',
                  fontSize: '15px',
                  backgroundColor: '#f1f1f1',
                  color: 'black',
                  lineHeight: '1.4'
                }}>
                  <span style={{
                    display: 'inline-block',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}>
                    AI is thinking...
                  </span>
                </div>
              </div>
            )}
            
            {/* FAQ Buttons */}
            {showFAQButtons && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginTop: '10px'
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  maxWidth: '75%'
                }}>
                  {['Our Hours', 'Contact Information', 'Location', 'Services'].map((topic) => (
                    <button
                      key={topic}
                      onClick={() => handleFAQClick(topic)}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: 'white',
                        color: '#007bff',
                        border: '2px solid #007bff',
                        borderRadius: '20px',
                        fontSize: '14px',
                        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#007bff';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.color = '#007bff';
                      }}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{
            padding: '20px',
            borderTop: '1px solid #e5e5e5',
            display: 'flex',
            gap: '12px'
          }}>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isLoading ? 'AI is responding...' : 'Ask me anything...'}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid #ddd',
                borderRadius: '25px',
                outline: 'none',
                fontSize: '15px',
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || isLoading}
              style={{
                padding: '12px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: (!inputText.trim() || isLoading) ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                opacity: (inputText.trim() && !isLoading) ? 1 : 0.5,
                fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
              }}
            >
              {isLoading ? '⏳' : 'Send'}
            </button>
          </div>
        </div>
      )}

      {/* Chat Button - Only show when closed */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="chat-button"
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0, 123, 255, 0.3)',
            fontSize: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            animation: 'fadeIn 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 123, 255, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 123, 255, 0.3)';
          }}
        >
          💬
        </button>
      )}
    </div>
  );
};

export default ChatWidget;