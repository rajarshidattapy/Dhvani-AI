import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './components/Home';
import PdfToVoice from './components/PdfToVoice';
import VoiceNotes from './components/VoiceNotes';
import VideoCaptioning from './components/VideoCaptioning';
import BrailleConverter from './components/BrailleConverter';
import ImageAnalysis from './components/ImageAnalysis';
import Chatbot from './components/Chatbot';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
          <Navbar />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8"
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pdf-to-voice" element={<PdfToVoice />} />
              <Route path="/voice-notes" element={<VoiceNotes />} />
              <Route path="/video-captioning" element={<VideoCaptioning />} />
              <Route path="/braille-converter" element={<BrailleConverter />} />
              <Route path="/image-analysis" element={<ImageAnalysis />} />
            </Routes>
          </motion.div>
          <Chatbot />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;