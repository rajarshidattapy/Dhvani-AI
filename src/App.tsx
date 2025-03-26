import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import PdfToVoice from './components/PdfToVoice';
import VoiceNotes from './components/VoiceNotes';
import VideoCaptioning from './components/VideoCaptioning';
import BrailleConverter from './components/BrailleConverter';
import ImageAnalysis from './components/ImageAnalysis';
import Chatbot from './components/Chatbot';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';

// Protected Route wrapper component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {user && <Navbar />}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <Routes>
          <Route path="/login" element={
            user ? <Navigate to="/" replace /> : <Login />
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/pdf-to-voice" element={
            <ProtectedRoute>
              <PdfToVoice />
            </ProtectedRoute>
          } />
          <Route path="/voice-notes" element={
            <ProtectedRoute>
              <VoiceNotes />
            </ProtectedRoute>
          } />
          <Route path="/video-captioning" element={
            <ProtectedRoute>
              <VideoCaptioning />
            </ProtectedRoute>
          } />
          <Route path="/braille-converter" element={
            <ProtectedRoute>
              <BrailleConverter />
            </ProtectedRoute>
          } />
          <Route path="/image-analysis" element={
            <ProtectedRoute>
              <ImageAnalysis />
            </ProtectedRoute>
          } />
        </Routes>
      </motion.div>
      {user && <Chatbot />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;