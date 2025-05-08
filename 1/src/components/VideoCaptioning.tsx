import React, { useState } from 'react';
import { Video, Upload } from 'lucide-react';
import { useVoiceNavigation } from '../hooks/useVoiceNavigation';

const MOCK_CAPTION = `Hi, I'm Phil from BBC Learning English.
Today I'm going to tell you how to use make and do.
Now, they can be tricky and there are some exceptions.
But here are four things to remember.
We use make when we create something...
like this cake!
We use do to talk about an activity.
What are you doing?
I'm doing some work.
We can use make to talk about something that
causes a reaction.
This music really makes me want to sing!
We can also use do with general activities.
What are you doing tomorrow?
I'm not doing anything.
Have you got any plans?`;

function VideoCaptioning() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [captions, setCaptions] = useState<string | null>(null);
  const { speak } = useVoiceNavigation();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsProcessing(true);
      speak('Processing video, please wait...');

      // Simulate 20 second processing
      setTimeout(() => {
        setCaptions(MOCK_CAPTION);
        setIsProcessing(false);
        speak('Captions are ready');
      }, 20000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Video Captioning</h1>
      
      <div className="bg-white rounded-xl shadow-xl p-8">
        <div className="border-3 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
            id="video-upload"
          />
          <label
            htmlFor="video-upload"
            className="flex flex-col items-center cursor-pointer"
          >
            {selectedFile ? (
              <>
                <Video className="w-16 h-16 text-indigo-500 mb-4" />
                <span className="text-xl text-gray-600 mb-2">{selectedFile.name}</span>
              </>
            ) : (
              <>
                <Upload className="w-16 h-16 text-gray-400 mb-4" />
                <span className="text-xl text-gray-600">Upload a video to generate captions</span>
              </>
            )}
          </label>
        </div>

        {isProcessing && (
          <div className="mt-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Processing video and generating captions...</p>
          </div>
        )}

        {captions && !isProcessing && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Generated Captions</h2>
            <div className="bg-gray-50 rounded-xl p-6 whitespace-pre-line">
              {captions}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoCaptioning;