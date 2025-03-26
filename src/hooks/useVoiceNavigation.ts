import { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface PageMessages {
  [key: string]: {
    [key: string]: string;
  };
}

const pageMessages: PageMessages = {
  'en-US': {
    '/': 'Welcome to Dhvani. Here are our features. Use voice commands or hover over items to learn more.',
    '/pdf-to-voice': 'PDF to Voice Converter. Upload a PDF file to convert it to speech.',
    '/voice-notes': 'Voice Notes. Record and manage your voice notes here.',
    '/video-captioning': 'Video Captioning. Upload a video to generate captions.',
    '/braille-converter': 'Braille Converter. Convert braille patterns to speech.',
    '/image-analysis': 'Image Analysis. Upload an image to understand its contents.'
  },
  'hi-IN': {
    '/': 'Dhvani mein aapka swagat hai. Yeh hamari features hain. Voice commands ka istemal karein ya items par hover karein janne ke liye.',
    '/pdf-to-voice': 'PDF se awaaz converter. Ek PDF file upload karein aur use speech mein badlein.',
    '/voice-notes': 'Voice Notes. Yahan apne voice notes record aur manage karein.',
    '/video-captioning': 'Video Captioning. Video upload karein aur captions generate karein.',
    '/braille-converter': 'Braille Converter. Braille patterns ko speech mein badlein.',
    '/image-analysis': 'Image Analysis. Ek image upload karein aur uske content ko samjhein.'
  },
  'bn-IN': {
    '/': 'Dhvani te apnake swagat. Ei holo amader features. Voice commands babohar korun ba items e hover korun janar jonno.',
    '/pdf-to-voice': 'PDF theke voice converter. Ekta PDF file upload korun ebong seta speech e poriborton korun.',
    '/voice-notes': 'Voice Notes. Ekhane apnar voice notes record ebong manage korun.',
    '/video-captioning': 'Video Captioning. Video upload korun ebong captions generate korun.',
    '/braille-converter': 'Braille Converter. Braille patterns ke speech e rupantor korun.',
    '/image-analysis': 'Image Analysis. Ekta chhobi upload korun ebong tar bisoybastu boozhun.'
  },
  'ta-IN': {
    '/': 'Dhvani-vil ungalai varaverkirōm. Itha namadhu features. Voice commands-ai payanpaduthungal alladhu items-ai hover seyungal therindhukollavum.',
    '/pdf-to-voice': 'PDF to Voice Converter. Oru PDF file-ai upload seyungal mattum adhai speech-āga māṟṟungal.',
    '/voice-notes': 'Voice Notes. Iṅku ungaḷ voice notes-ai record matrum manage seyungal.',
    '/video-captioning': 'Video Captioning. Oru video upload seyungal matrum captions generate seyungal.',
    '/braille-converter': 'Braille Converter. Braille patterns-ai speech-āga māṟṟungal.',
    '/image-analysis': 'Image Analysis. Oru image upload seyungal matrum adhan poruḷ purindhukoḷḷungal.'
  },
  'te-IN': {
    '/': 'Dhvani ki swagatam. Ivi ma features. Voice commands vadandi lekapote items meedha hover chesi telusukondi.',
    '/pdf-to-voice': 'PDF to Voice Converter. Oka PDF file upload chesi speech ga marchandi.',
    '/voice-notes': 'Voice Notes. Ikada mi voice notes record mariyu manage cheyyandi.',
    '/video-captioning': 'Video Captioning. Video upload chesi captions generate cheyyandi.',
    '/braille-converter': 'Braille Converter. Braille patterns ni speech ga marchandi.',
    '/image-analysis': 'Image Analysis. Oka image upload chesi dhani vishayalu ardham cheskondi.'
  },
  'kn-IN': {
    '/': 'Dhvani ge swagatavannu. Idu namma features. Voice commands balasi athava items mele hover madi tilidukolli.',
    '/pdf-to-voice': 'PDF to Voice Converter. Ondu PDF file upload madi matthu adannu speech ge parivartisi.',
    '/voice-notes': 'Voice Notes. Illi nimmna voice notes record matthu manage madi.',
    '/video-captioning': 'Video Captioning. Video upload madi matthu captions generate madi.',
    '/braille-converter': 'Braille Converter. Braille patterns annannu speech ge parivartisi.',
    '/image-analysis': 'Image Analysis. Ondu image upload madi matthu adara vishayagalu tilidukolli.'
  }
};

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionResultEvent {
  results: {
    length: number;
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: (event: SpeechRecognitionResultEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export const useVoiceNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const hasSpokenInitialMessage = useRef<boolean>(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [language, setLanguage] = useState(() => 
    localStorage.getItem('preferredLanguage') || 'en-US'
  );

  const commands = useMemo(() => [
    { command: 'go home', action: () => navigate('/') },
    { command: 'pdf to voice', action: () => navigate('/pdf-to-voice') },
    { command: 'voice notes', action: () => navigate('/voice-notes') },
    { command: 'video captioning', action: () => navigate('/video-captioning') },
    { command: 'braille converter', action: () => navigate('/braille-converter') },
    { command: 'image analysis', action: () => navigate('/image-analysis') },
  ], [navigate]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback((text: string, force: boolean = false) => {
    // Don't speak on login page unless forced
    if (location.pathname === '/login' && !force) {
      return;
    }

    // Cancel any ongoing speech
    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [language, location.pathname, stopSpeaking]);

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
      // First try to get the current permission state
      const permissionResult = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      
      if (permissionResult.state === 'granted') {
        return true;
      }
      
      if (permissionResult.state === 'prompt') {
        // Try to get user media to trigger the permission prompt
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
      }
      
      if (permissionResult.state === 'denied') {
        speak('Voice navigation requires microphone access. Please enable it in your browser settings.', true);
        return false;
      }
      
      return false;
    } catch {
      // If permissions API is not supported, try to get user media directly
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
      } catch (mediaError) {
        console.error('Microphone permission error:', mediaError);
        speak('Voice navigation requires microphone access. Please enable it in your browser settings.', true);
        return false;
      }
    }
  };

  const startListening = async (recognition: SpeechRecognition) => {
    if (location.pathname === '/login') {
      return;
    }

    try {
      const hasPermission = await requestMicrophonePermission();
      if (hasPermission) {
        // Add a small delay to ensure the recognition is properly initialized
        setTimeout(() => {
          try {
            recognition.start();
            setIsListening(true);
            setLastError(null);
          } catch (startError) {
            console.error('Error starting recognition:', startError);
            setIsListening(false);
            setLastError(startError instanceof Error ? startError.message : 'Unknown error');
          }
        }, 100);
      }
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        speak('Microphone access was denied. Please enable it in your browser settings.', true);
      } else {
        speak('Unable to start voice navigation. Please try again.', true);
      }
      setIsListening(false);
      setLastError(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  useEffect(() => {
    if (location.pathname !== '/login' && !hasSpokenInitialMessage.current) {
      const message = pageMessages[language]?.[location.pathname];
      if (message) {
        speak(message);
        hasSpokenInitialMessage.current = true;
      }
    }
  }, [location.pathname, speak, language]);

  useEffect(() => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      console.error('Speech recognition is not supported in this browser');
      speak('Voice navigation is not supported in this browser', true);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = language;

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      processVoiceCommand(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setLastError(event.error);
      
      if (event.error === 'not-allowed') {
        speak('Please enable microphone access in your browser settings to use voice navigation', true);
        setIsListening(false);
      } else if (event.error === 'aborted') {
        setIsListening(false);
      } else if (event.error === 'no-speech') {
        speak('No speech detected. Please try speaking again.', true);
      }
    };

    recognition.onend = () => {
      if (isListening && !lastError && location.pathname !== '/login') {
        setTimeout(() => {
          if (recognitionRef.current) {
            startListening(recognitionRef.current);
          }
        }, 1000);
      } else {
        setIsListening(false);
      }
    };

    if (location.pathname !== '/login') {
      startListening(recognition);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    };
  }, [processVoiceCommand, speak, isListening, language, location.pathname, lastError]);

  useEffect(() => {
    const handleStorageChange = () => {
      const newLanguage = localStorage.getItem('preferredLanguage') || 'en-US';
      if (newLanguage !== language) {
        setLanguage(newLanguage);
        if (recognitionRef.current) {
          recognitionRef.current.stop();
          recognitionRef.current.lang = newLanguage;
          if (isListening) {
            startListening(recognitionRef.current);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [language, isListening]);

  return { 
    speak, 
    stopSpeaking, 
    isListening, 
    isSpeaking,
    language 
  };
};