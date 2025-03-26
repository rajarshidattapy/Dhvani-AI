import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Mic, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useVoiceNavigation } from '../hooks/useVoiceNavigation';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  isVoice?: boolean;
  audioUrl?: string;
}

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('chatMessages');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const { speak, isListening, language } = useVoiceNavigation();
  const navigate = useNavigate();
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const { user } = useAuth();

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Add voice message to chat
        const voiceMessage: Message = {
          id: Date.now().toString(),
          text: '🎤 Voice Message',
          isUser: true,
          isVoice: true,
          audioUrl
        };
        setMessages(prev => [...prev, voiceMessage]);

        // Convert to text and send to API
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
          const { data } = await axios.post('/api/voice-notes', formData);
          handleSubmit(null, data.transcription);
        } catch (error) {
          console.error('Error processing voice message:', error);
          speak('Sorry, I encountered an error processing your voice message');
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      speak('Unable to start recording. Please check your microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent, voiceText?: string) => {
    e?.preventDefault();
    const messageText = voiceText || input;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Check for navigation commands first
    if (handleNavigation(messageText)) {
      return;
    }

    try {
      const { data } = await axios.post('/api/chatbot', { 
        message: messageText,
        userId: user?.uid // Include user ID in requests
      });
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

  if (!user) return null;

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
                  {message.isVoice && message.audioUrl ? (
                    <audio src={message.audioUrl} controls className="w-full" />
                  ) : (
                    message.text
                  )}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2 rounded-lg ${
                  isRecording ? 'bg-red-500' : 'bg-gray-200'
                } hover:bg-opacity-80 transition-colors`}
              >
                <Mic className={`w-5 h-5 ${isRecording ? 'text-white' : 'text-gray-600'}`} />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message or say 'Go to...'"
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default Chatbot;