import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import axios from 'axios';
import { useVoiceNavigation } from '../hooks/useVoiceNavigation';

function PdfToVoice() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { speak } = useVoiceNavigation();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      speak(`Selected file: ${file.name}`);
    }
  };

  const handleConvert = async () => {
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post('/api/pdf-to-voice', formData);
      const audioData = response.data.audio;
      const blob = new Blob([Buffer.from(audioData, 'base64')], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      speak('PDF has been converted to voice successfully');
    } catch (error) {
      console.error('Error converting PDF:', error);
      speak('Sorry, there was an error converting the PDF');
    } finally {
      setLoading(false);
    }
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
        
        {selectedFile && (
          <div className="mt-8">
            <button
              onClick={handleConvert}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl text-xl font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Converting...' : 'Convert to Voice'}
            </button>
          </div>
        )}

        {audioUrl && (
          <div className="mt-8">
            <audio controls className="w-full" src={audioUrl}>
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
}

export default PdfToVoice;