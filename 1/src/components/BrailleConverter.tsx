import React, { useState } from 'react';
import { useVoiceNavigation } from '../hooks/useVoiceNavigation';

function BrailleConverter() {
  const [brailleInput, setBrailleInput] = useState('');
  const [convertedText, setConvertedText] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const { speak } = useVoiceNavigation();

  const handleConvert = () => {
    if (!brailleInput.trim()) return;

    setIsConverting(true);
    speak('Converting braille pattern...');

    setTimeout(() => {
      const mockResponse = "I'm Rajarshi, nice to meet you!";
      setConvertedText(mockResponse);
      setIsConverting(false);
      speak(mockResponse);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Braille to Speech Converter</h1>
      
      <div className="bg-white rounded-xl shadow-xl p-8">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Braille Pattern
          </label>
          <textarea
            value={brailleInput}
            onChange={(e) => setBrailleInput(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter Braille pattern here..."
          />
        </div>
        
        <button
          onClick={handleConvert}
          disabled={isConverting || !brailleInput.trim()}
          className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl text-xl font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isConverting ? 'Converting...' : 'Convert to Speech'}
        </button>

        {isConverting && (
          <div className="mt-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Converting braille pattern...</p>
          </div>
        )}

        {convertedText && !isConverting && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-3">Converted Text</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <p className="text-gray-800">{convertedText}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BrailleConverter;