import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useVoiceNavigation } from '../hooks/useVoiceNavigation';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('chatMessages');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const { speak, isListening } = useVoiceNavigation();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const handleNavigation = (text: string) => {
    const routes = {
      'voice notes': '/voice-notes',
      'pdf to voice': '/pdf-to-voice',
      'video captioning': '/video-captioning',
      'braille converter': '/braille-converter',
      'image analysis': '/image-analysis',
      'home': '/'
    };

    const command = Object.entries(routes).find(([key]) => 
      text.toLowerCase().includes(key)
    );

    if (command) {
      const [name, path] = command;
      speak(`Navigating to ${name}`);
      navigate(path);
      return true;
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Check for navigation commands first
    if (handleNavigation(input)) {
      return;
    }

    try {
      const { data } = await axios.post('/api/chatbot', { message: input });
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        isUser: false
      };
      setMessages(prev => [...prev, botMessage]);
      speak(data.response);
    } catch (error) {
      console.error('Error sending message:', error);
      speak('Sorry, I encountered an error processing your message');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 p-4 ${
          isListening ? 'bg-green-600' : 'bg-indigo-600'
        } rounded-full hover:bg-indigo-700 transition-colors shadow-lg`}
        title={isListening ? 'Voice Navigation Active' : 'Open Chat'}
      >
        <MessageCircle className="w-8 h-8 text-white" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-8 w-96 bg-white rounded-xl shadow-2xl">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="text-lg font-semibold">Dhvani Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-xl ${
                    message.isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message or say 'Go to...'"
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default Chatbot;