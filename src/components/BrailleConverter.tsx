import React from 'react';
import { Type } from 'lucide-react';

function BrailleConverter() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Braille to Speech Converter</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Braille Pattern
          </label>
          <textarea
            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter Braille pattern here..."
          />
        </div>
        
        <button className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors">
          Convert to Speech
        </button>
      </div>
    </div>
  );
}

export default BrailleConverter;