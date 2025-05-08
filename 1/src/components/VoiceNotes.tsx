import React, { useState, useEffect } from 'react';
import { Mic, Trash2 } from 'lucide-react';
import { useReactMediaRecorder } from 'react-media-recorder';
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
  const { status, startRecording, stopRecording } = useReactMediaRecorder({ audio: true });
  const { speak } = useVoiceNavigation();
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('voiceNotes', JSON.stringify(notes));
  }, [notes]);

  const handleStartRecording = () => {
    startRecording();
    // Set timer to stop recording after 5 seconds
    const timer = window.setTimeout(() => {
      stopRecording();
      setIsTranscribing(true);
      
      // Simulate transcription and show the message
      setTimeout(() => {
        const newNote: VoiceNote = {
          id: Date.now().toString(),
          text: "Hi, I am Rajarshi, am participating in Google Solution Challenge",
          timestamp: new Date().toLocaleString()
        };

        setNotes(prev => [...prev, newNote]);
        speak(newNote.text);
        setIsTranscribing(false);
      }, 2000);
    }, 5000);
    setRecordingTimer(timer);
  };

  const handleStopRecording = () => {
    if (recordingTimer) {
      clearTimeout(recordingTimer);
      setRecordingTimer(null);
    }
    stopRecording();
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
            onClick={status === 'recording' ? handleStopRecording : handleStartRecording}
            className={`p-6 ${status === 'recording' ? 'bg-red-600' : 'bg-red-500'} rounded-full hover:bg-red-600 transition-colors`}
          >
            <Mic className="w-12 h-12 text-white" />
          </button>
        </div>
        
        <div className="space-y-6">
          {isTranscribing && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Processing your recording...</p>
            </div>
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