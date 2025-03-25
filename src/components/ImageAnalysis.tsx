import React, { useState } from 'react';
import { Image, Upload } from 'lucide-react';
import axios from 'axios';
import { useVoiceNavigation } from '../hooks/useVoiceNavigation';

interface AnalysisResult {
  labels: string[];
  description: string;
}

function ImageAnalysis() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { speak } = useVoiceNavigation();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      speak('Image selected. Click analyze to understand what\'s in the image.');
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const { data } = await axios.post<AnalysisResult>('/api/analyze-image', formData);
      setAnalysis(data);
      speak(data.description);
    } catch (error) {
      console.error('Error analyzing image:', error);
      speak('Sorry, there was an error analyzing the image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Image Analysis</h1>
      
      <div className="bg-white rounded-xl shadow-xl p-8">
        <div className="border-3 border-dashed border-gray-300 rounded-xl p-12 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center cursor-pointer"
          >
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-w-full h-64 object-contain mb-6"
              />
            ) : (
              <Upload className="w-16 h-16 text-gray-400 mb-6" />
            )}
            <span className="text-xl text-gray-600">
              {selectedImage ? selectedImage.name : 'Upload an image for analysis'}
            </span>
          </label>
        </div>

        {selectedImage && (
          <div className="mt-8">
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl text-xl font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
            >
              {loading ? 'Analyzing...' : 'Analyze Image'}
            </button>
          </div>
        )}

        {analysis && (
          <div className="mt-8 space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Description</h3>
              <p className="text-gray-700">{analysis.description}</p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Labels</h3>
              <div className="flex flex-wrap gap-2">
                {analysis.labels.map((label, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageAnalysis;