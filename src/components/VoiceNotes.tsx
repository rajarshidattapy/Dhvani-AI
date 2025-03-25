import React, { useState, useEffect } from 'react';
import { Mic, Save, Trash2 } from 'lucide-react';
import { useReactMediaRecorder } from 'react-media-recorder';
import axios from 'axios';
import { useVoiceNavigation } from '../hooks/useVoiceNavigation';

interface VoiceNote {
  id: string;
  text: string;
  timestamp: string;
}

function VoiceNotes() {
  const [notes, setNotes] = useState<VoiceNote[]>(() => {
    const saved = localStorage.getItem('voiceNotes');
    return saved ? JSON.parse(saved) : [];
  });
  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({ audio: true });
  const { speak } = useVoiceNavigation();
  const [isTranscribing, setIsTranscribing] = useState(false);

  useEffect(() => {
    localStorage.setItem('voiceNotes', JSON.stringify(notes));
  }, [notes]);

  const handleSaveRecording = async () => {
    if (!mediaBlobUrl) return;

    setIsTranscribing(true);
    try {
      const response = await fetch(mediaBlobUrl);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('audio', blob);

      const { data } = await axios.post('/api/voice-notes', formData);
      const newNote: VoiceNote = {
        id: Date.now().toString(),
        text: data.transcription,
        timestamp: new Date().toLocaleString()
      };

      setNotes(prev => [...prev, newNote]);
      speak('Voice note saved successfully');
    } catch (error) {
      console.error('Error saving voice note:', error);
      speak('Sorry, there was an error saving your voice note');
    } finally {
      setIsTranscribing(false);
    }
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    speak('Voice note deleted');
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Voice Notes</h1>
      
      <div className="bg-white rounded-xl shadow-xl p-8">
        <div className="flex justify-center mb-8">
          <button 
            onClick={status === 'recording' ? stopRecording : startRecording}
            className={`p-6 ${status === 'recording' ? 'bg-red-600' : 'bg-red-500'} rounded-full hover:bg-red-600 transition-colors`}
          >
            <Mic className="w-12 h-12 text-white" />
          </button>
        </div>
        
        <div className="space-y-6">
          {status === 'stopped' && mediaBlobUrl && !isTranscribing && (
            <div className="flex justify-center">
              <button
                onClick={handleSaveRecording}
                className="flex items-center px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors"
              >
                <Save className="w-6 h-6 mr-2" />
                Save Recording
              </button>
            </div>
          )}

          {isTranscribing && (
            <p className="text-center text-gray-600">Transcribing your recording...</p>
          )}

          <div className="space-y-4">
            {notes.map(note => (
              <div key={note.id} className="bg-gray-50 rounded-xl p-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-500">{note.timestamp}</span>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-800">{note.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoiceNotes;