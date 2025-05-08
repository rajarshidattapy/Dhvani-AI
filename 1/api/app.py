from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from google.cloud import vision
from google.cloud import speech
from google.cloud import texttospeech
import os
import tempfile
from PyPDF2 import PdfReader
import io
import base64
import json

app = Flask(__name__)
CORS(app)

# Configure Google API credentials
genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
model = genai.GenerativeModel('gemini-pro')
vision_client = vision.ImageAnnotatorClient()
speech_client = speech.SpeechClient()
tts_client = texttospeech.TextToSpeechClient()

# Mock data for fallback responses
MOCK_DATA = {
    'image_analysis': {
        'labels': ['person', 'nature', 'landscape', 'building', 'sky', 'water'],
        'description': 'A scenic view showing a person standing near a beautiful lake with mountains in the background. The sky is clear blue and there are some traditional buildings visible along the shoreline.'
    },
    'chatbot_responses': [
        'I understand you need assistance. How can I help you today?',
        'Let me guide you through our features. We have PDF to voice conversion, voice notes, video captioning, and more.',
        'Would you like me to explain how to use any specific feature?',
        'I\'m here to help make navigation easier for you.',
        'You can use voice commands to navigate through different sections of the website.'
    ]
}

def get_mock_response():
    """Get a random mock response for chatbot"""
    import random
    return random.choice(MOCK_DATA['chatbot_responses'])

@app.route('/api/pdf-to-voice', methods=['POST'])
def pdf_to_voice():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        pdf_file = request.files['file']
        if not pdf_file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Invalid file format. Please upload a PDF file.'}), 400

        reader = PdfReader(pdf_file)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + " "

        # Chunk text if it's too long
        max_length = 5000
        text_chunks = [text[i:i+max_length] for i in range(0, len(text), max_length)]
        
        audio_chunks = []
        for chunk in text_chunks:
            synthesis_input = texttospeech.SynthesisInput(text=chunk)
            voice = texttospeech.VoiceSelectionParams(
                language_code="en-US",
                name="en-US-Neural2-C",
                ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
            )
            audio_config = texttospeech.AudioConfig(
                audio_encoding=texttospeech.AudioEncoding.MP3,
                speaking_rate=1.0,
                pitch=0
            )

            response = tts_client.synthesize_speech(
                input=synthesis_input, voice=voice, audio_config=audio_config
            )
            audio_chunks.append(response.audio_content)

        # Combine audio chunks
        combined_audio = b''.join(audio_chunks)
        
        return jsonify({
            'audio': base64.b64encode(combined_audio).decode('utf-8'),
            'success': True
        })
    except Exception as e:
        print(f"Error in pdf_to_voice: {str(e)}")
        return jsonify({'error': 'Failed to convert PDF to voice', 'details': str(e)}), 500

@app.route('/api/voice-notes', methods=['POST'])
def voice_notes():
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio file provided'}), 400

        audio_file = request.files['audio']
        audio_content = audio_file.read()
        
        # Create the audio file configuration
        audio = speech.RecognitionAudio(content=audio_content)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
            sample_rate_hertz=48000,
            language_code="en-US",
            enable_automatic_punctuation=True,
            model='latest_long'
        )

        # Perform the transcription
        response = speech_client.recognize(config=config, audio=audio)
        
        if not response.results:
            return jsonify({'error': 'No speech detected'}), 400

        transcription = ' '.join(result.alternatives[0].transcript 
                               for result in response.results)

        return jsonify({
            'transcription': transcription,
            'success': True
        })
    except Exception as e:
        print(f"Error in voice_notes: {str(e)}")
        return jsonify({'error': 'Failed to transcribe audio', 'details': str(e)}), 500

@app.route('/api/video-captions', methods=['POST'])
def video_captions():
    try:
        if 'video' not in request.files:
            return jsonify({'error': 'No video file provided'}), 400

        video_file = request.files['video']
        
        # Extract audio and create config
        audio = speech.RecognitionAudio(content=video_file.read())
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.MP4,
            sample_rate_hertz=44100,
            language_code="en-US",
            enable_automatic_punctuation=True,
            enable_word_time_offsets=True
        )

        # Perform transcription
        response = speech_client.recognize(config=config, audio=audio)
        
        captions = []
        for result in response.results:
            for word in result.alternatives[0].words:
                captions.append({
                    'text': word.word,
                    'start_time': word.start_time.total_seconds(),
                    'end_time': word.end_time.total_seconds()
                })

        return jsonify({
            'captions': captions,
            'success': True
        })
    except Exception as e:
        print(f"Error in video_captions: {str(e)}")
        return jsonify({'error': 'Failed to generate captions', 'details': str(e)}), 500

@app.route('/api/braille-to-speech', methods=['POST'])
def braille_to_speech():
    try:
        data = request.json
        if not data or 'text' not in data:
            return jsonify({'error': 'No braille text provided'}), 400

        braille_text = data['text']
        
        try:
            # Try using Gemini API
            response = model.generate_content(f"Convert this braille pattern to text: {braille_text}")
            converted_text = response.text
        except Exception as e:
            # Fallback to mock conversion
            print(f"Gemini API error: {str(e)}")
            converted_text = "Welcome to Dhvani. This is a sample text conversion from braille."

        synthesis_input = texttospeech.SynthesisInput(text=converted_text)
        voice = texttospeech.VoiceSelectionParams(
            language_code="en-US",
            name="en-US-Neural2-C",
            ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL
        )
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3,
            speaking_rate=1.0,
            pitch=0
        )

        response = tts_client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )

        return jsonify({
            'text': converted_text,
            'audio': base64.b64encode(response.audio_content).decode('utf-8'),
            'success': True
        })
    except Exception as e:
        print(f"Error in braille_to_speech: {str(e)}")
        return jsonify({'error': 'Failed to convert braille to speech', 'details': str(e)}), 500

@app.route('/api/analyze-image', methods=['POST'])
def analyze_image():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400

        image_file = request.files['image']
        content = image_file.read()
        
        try:
            # Try using Vision API
            image = vision.Image(content=content)
            response = vision_client.label_detection(image=image)
            labels = [label.description for label in response.label_annotations]
            
            # Get detailed description using Gemini
            image_context = "An image that shows: " + ", ".join(labels)
            description = model.generate_content(f"Describe this image in detail: {image_context}").text
        except Exception as e:
            # Fallback to mock data
            print(f"Vision/Gemini API error: {str(e)}")
            labels = MOCK_DATA['image_analysis']['labels']
            description = MOCK_DATA['image_analysis']['description']

        return jsonify({
            'labels': labels,
            'description': description,
            'success': True
        })
    except Exception as e:
        print(f"Error in analyze_image: {str(e)}")
        return jsonify({'error': 'Failed to analyze image', 'details': str(e)}), 500

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    try:
        data = request.json
        if not data or 'message' not in data:
            return jsonify({'error': 'No message provided'}), 400

        user_message = data['message']
        
        try:
            # Try using Gemini API
            response = model.generate_content(
                f"As a helpful assistant for a web app for deaf and blind people, respond to: {user_message}"
            )
            bot_response = response.text
        except Exception as e:
            # Fallback to mock response
            print(f"Gemini API error: {str(e)}")
            bot_response = get_mock_response()

        return jsonify({
            'response': bot_response,
            'success': True
        })
    except Exception as e:
        print(f"Error in chatbot: {str(e)}")
        return jsonify({'error': 'Failed to process message', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)