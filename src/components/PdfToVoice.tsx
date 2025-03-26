import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { useVoiceNavigation } from '../hooks/useVoiceNavigation';

function PdfToVoice() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showReadButton, setShowReadButton] = useState(false);
  const { speak } = useVoiceNavigation();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowReadButton(true);
      speak(`Selected file: ${file.name}`);
    }
  };

  const handleRead = () => {
    speak("This book is called Ginger the Giraffe by T.Albert, should I continue reading?");
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">PDF to Voice Converter</h1>
      
      <div className="bg-white rounded-xl shadow-xl p-8">
        <div className="border-3 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            id="pdf-upload"
          />
          <label
            htmlFor="pdf-upload"
            className="flex flex-col items-center cursor-pointer"
          >
            <Upload className="w-16 h-16 text-gray-400 mb-6" />
            <span className="text-xl text-gray-600">
              {selectedFile ? selectedFile.name : 'Upload PDF file'}
            </span>
          </label>
        </div>
        
        {showReadButton && (
          <div className="mt-8">
            <button
              onClick={handleRead}
              className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl text-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Read
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PdfToVoice;