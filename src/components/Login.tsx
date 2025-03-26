import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe2, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useVoiceNavigation } from '../hooks/useVoiceNavigation';

const languages = [
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'hi-IN', name: 'हिंदी', flag: '🇮🇳' },
  { code: 'bn-IN', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'ta-IN', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te-IN', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn-IN', name: 'ಕನ್ನಡ', flag: '🇮🇳' }
];

function Login() {
  const { signIn, error } = useAuth();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState(() => 
    localStorage.getItem('preferredLanguage') || 'en-US'
  );
  const { speak, stopSpeaking } = useVoiceNavigation();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setSelectedLanguage(newLanguage);
    localStorage.setItem('preferredLanguage', newLanguage);
    
    // Find the language name to speak
    const lang = languages.find(l => l.code === newLanguage);
    if (lang) {
      stopSpeaking();
      speak(`Language changed to ${lang.name}`, true);
    }
  };

  const handleSignIn = async () => {
    try {
      await signIn();
      localStorage.setItem('preferredLanguage', selectedLanguage);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const lang = languages.find(l => l.code === selectedLanguage);
      speak(`Welcome to Dhvani. Current language is ${lang?.name}. Please select your preferred language and sign in to continue.`, true);
    }
    setIsSpeaking(!isSpeaking);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Dhvani</h1>
          <p className="text-gray-600">Education is for everyone!</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4" />
                Select Voice Assistant Language
              </div>
              <button
                onClick={toggleSpeaking}
                className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${isSpeaking ? 'text-indigo-600' : 'text-gray-600'}`}
                aria-label={isSpeaking ? 'Stop speaking' : 'Start speaking'}
              >
                {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
          </label>
          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSignIn}
          className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <span className="text-xl" role="img" aria-label="Google">🔑</span>
          Sign in with Google
        </button>

        <div className="mt-6 text-center text-sm text-gray-600">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
}

export default Login;