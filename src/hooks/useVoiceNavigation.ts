import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface VoiceCommand {
  command: string;
  action: () => void;
}

export const useVoiceNavigation = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);

  const commands: VoiceCommand[] = [
    { command: 'go home', action: () => navigate('/') },
    { command: 'pdf to voice', action: () => navigate('/pdf-to-voice') },
    { command: 'voice notes', action: () => navigate('/voice-notes') },
    { command: 'video captioning', action: () => navigate('/video-captioning') },
    { command: 'braille converter', action: () => navigate('/braille-converter') },
    { command: 'image analysis', action: () => navigate('/image-analysis') },
  ];

  const speak = useCallback((text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  }, []);

  const processVoiceCommand = useCallback((transcript: string) => {
    const command = commands.find(cmd => 
      transcript.toLowerCase().includes(cmd.command.toLowerCase())
    );
    
    if (command) {
      speak(`Navigating to ${command.command}`);
      command.action();
    }
  }, [commands, speak]);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream after getting permission
      return true;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      speak('Voice navigation requires microphone access. Please enable it in your browser settings.');
      return false;
    }
  };

  const startListening = async (recognition: SpeechRecognition) => {
    try {
      const hasPermission = await requestMicrophonePermission();
      if (hasPermission) {
        recognition.start();
        setIsListening(true);
      }
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      speak('Unable to start voice navigation. Please try again.');
    }
  };

  useEffect(() => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      console.error('Speech recognition is not supported in this browser');
      speak('Voice navigation is not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      processVoiceCommand(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        speak('Please enable microphone access in your browser settings to use voice navigation');
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      if (isListening) {
        // Attempt to restart if it was supposed to be listening
        startListening(recognition);
      }
    };

    // Initial start
    startListening(recognition);

    return () => {
      recognition.stop();
      setIsListening(false);
    };
  }, [processVoiceCommand, speak, isListening]);

  return { speak, isListening };
};

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}