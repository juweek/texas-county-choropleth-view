import React, { useState, useEffect } from 'react';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);

  // Get API URL from environment variable or use localhost for development
  const API_URL = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:8000';

  // Check connection status when component mounts and periodically while loading
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(`${API_URL}/api/health`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
        const data = await response.json();
        setIsConnected(response.ok);
        setIsDataLoaded(data.data_loaded);
        setIsDataLoading(data.data_loading);
        console.log('Connection status:', response.ok ? 'Connected' : 'Disconnected', 
                   'Data loaded:', data.data_loaded,
                   'Data loading:', data.data_loading);
      } catch (error) {
        setIsConnected(false);
        setIsDataLoaded(false);
        setIsDataLoading(false);
        console.error('Connection check failed:', error);
      }
    };

    // Initial check
    checkConnection();

    // Only set up periodic checks if data is not loaded
    let intervalId: NodeJS.Timeout | null = null;
    if (!isDataLoaded) {
      intervalId = setInterval(checkConnection, 30000); // Check every 30 seconds
    }

    // Cleanup interval on component unmount or when data is loaded
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [API_URL, isDataLoaded]); // Add isDataLoaded to dependencies to stop checking when loaded

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const newMessage: Message = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
    };
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chatbot');
      }

      const data = await response.json();
      
      // Add bot response
      const botResponse: Message = {
        id: Date.now() + 1,
        text: data.response,
        isUser: false,
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      // Add error message
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting to the server. Please try again later.",
        isUser: false,
      };
      setMessages(prev => [...prev, errorMessage]);
      console.error('Error:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-lg flex flex-col transition-all duration-300 z-50 ${
      isCollapsed ? 'w-64 h-16' : 'w-96 h-[600px]'
    }`}>
      {/* Header */}
      <div className="p-4 bg-blue-600 text-white rounded-t-lg flex justify-between items-center cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold">TDIS Assistant</h3>
          {isConnected !== null && (
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            </div>
          )}
        </div>
        <button 
          className="text-white hover:text-gray-200 focus:outline-none"
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }}
        >
          {!isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      {/* Messages Container */}
      {!isCollapsed && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isConnected === false ? "Chatbot is currently offline" : "Type your message..."}
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading || isConnected === false}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || isConnected === false}
              >
                Send
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
} 