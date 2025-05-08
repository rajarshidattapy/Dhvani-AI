import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useVoiceNavigation } from '../hooks/useVoiceNavigation';

function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { speak, stopSpeaking, isSpeaking } = useVoiceNavigation();

  const handleSignOut = async () => {
    stopSpeaking();
    await signOut();
    navigate('/login');
  };

  const toggleSpeaking = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speak('Voice navigation enabled');
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center"
              onMouseEnter={() => speak('Home')}
              onMouseLeave={() => stopSpeaking()}
            >
              <span className="text-3xl" role="img" aria-label="Blind person">👨‍🦯</span>
              <span className="ml-2 text-2xl font-bold text-gray-900">Dhvani</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-gray-700">{user.email}</span>
                <button
                  onClick={toggleSpeaking}
                  className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                    isSpeaking ? 'text-indigo-600' : 'text-gray-600'
                  }`}
                  aria-label={isSpeaking ? 'Stop speaking' : 'Start speaking'}
                  onMouseEnter={() => speak(isSpeaking ? 'Stop speaking' : 'Start speaking')}
                  onMouseLeave={() => stopSpeaking()}
                >
                  {isSpeaking ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleSignOut}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  onMouseEnter={() => speak('Sign Out')}
                  onMouseLeave={() => stopSpeaking()}
                >
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;