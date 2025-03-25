import React from 'react';
import { Video } from 'lucide-react';

function VideoCaptioning() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Video Captioning</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Upload a video to generate captions</p>
        </div>
      </div>
    </div>
  );
}

export default VideoCaptioning;