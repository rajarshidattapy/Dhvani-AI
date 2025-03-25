import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Mic, 
  Video, 
  Type, 
  Image as ImageIcon, 
  MessageCircle 
} from 'lucide-react';
import { useVoiceNavigation } from '../hooks/useVoiceNavigation';

const features = [
  {
    icon: FileText,
    title: 'PDF to Voice',
    description: 'Convert PDF documents into spoken words',
    path: '/pdf-to-voice',
    color: 'bg-blue-500',
    position: 'top left'
  },
  {
    icon: Mic,
    title: 'Voice Notes',
    description: 'Record and save voice notes for future reference',
    path: '/voice-notes',
    color: 'bg-green-500',
    position: 'top right'
  },
  {
    icon: Video,
    title: 'Video Captioning',
    description: 'Automatic captions for video content',
    path: '/video-captioning',
    color: 'bg-red-500',
    position: 'middle left'
  },
  {
    icon: Type,
    title: 'Braille Converter',
    description: 'Convert Braille to spoken language',
    path: '/braille-converter',
    color: 'bg-purple-500',
    position: 'middle right'
  },
  {
    icon: ImageIcon,
    title: 'Image Analysis',
    description: 'Understand what\'s happening in images',
    path: '/image-analysis',
    color: 'bg-yellow-500',
    position: 'bottom left'
  },
  {
    icon: MessageCircle,
    title: 'Voice Assistant',
    description: 'AI-powered voice assistant to help you navigate',
    path: '#',
    color: 'bg-indigo-500',
    position: 'bottom right'
  }
];

function Home() {
  const { speak } = useVoiceNavigation();

  useEffect(() => {
    const welcomeMessage = "Welcome to Dhvani. " + features.map(f => 
      `The ${f.title} feature is located in the ${f.position} of your screen.`
    ).join(' ');
    speak(welcomeMessage);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to Dhvani
        </h1>
        <p className="text-xl text-gray-600">
          Breaking barriers in communication through innovative technology
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onMouseEnter={() => speak(feature.title + ". " + feature.description)}
          >
            <Link
              to={feature.path}
              className="block h-full"
            >
              <div className="h-full bg-white rounded-xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300">
                <div className={`${feature.color} w-16 h-16 rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-lg text-gray-600">
                  {feature.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default Home;