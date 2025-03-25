# Dhvani - Local Development Guide

This guide will help you set up and run Dhvani on your local machine.

## Prerequisites

1. **Node.js**: Version 18 or higher
2. **Python**: Version 3.8 or higher
3. **Git**: For version control
4. **Google Cloud Account**: For API access

## Setup Instructions

### 1. Clone the Repository

```bash
git clone [your-repository-url]
cd dhvani
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### 3. Backend Setup

```bash
# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file for backend
cp api/.env.example api/.env
```

### 4. API Setup

You'll need to set up the following APIs in Google Cloud Console:

1. **Google Cloud Project Setup**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project
   - Enable billing for the project

2. **Enable Required APIs**:
   - Gemini API
   - Cloud Vision API
   - Cloud Speech-to-Text API
   - Cloud Text-to-Speech API

3. **Create API Credentials**:
   - Create a service account
   - Download the JSON key file
   - Add the key file path to your backend `.env`

### 5. Environment Variables

#### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

#### Backend (api/.env)
```
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/service-account-key.json
GOOGLE_API_KEY=your_api_key
```

### 6. Running the Application

1. **Start the Backend**:
```bash
# In the project root
npm run start-api
```

2. **Start the Frontend**:
```bash
# In a new terminal
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Free API Alternatives

If you don't want to use Google Cloud APIs, here are some free alternatives:

1. **Speech Recognition**:
   - [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) (built into browsers)
   - [Vosk](https://alphacephei.com/vosk/) (offline)

2. **Text-to-Speech**:
   - [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) (built into browsers)
   - [Festival](http://www.cstr.ed.ac.uk/projects/festival/) (offline)

3. **Image Analysis**:
   - [TensorFlow.js](https://www.tensorflow.org/js) (client-side)
   - [ml5.js](https://ml5js.org/) (client-side)

4. **Language Models**:
   - [Hugging Face](https://huggingface.co/) (free tier)
   - [GPT-J](https://github.com/kingoflolz/mesh-transformer-jax) (self-hosted)

## Troubleshooting

1. **Microphone Access**:
   - Ensure your browser has permission to access the microphone
   - Check browser settings if permission dialog doesn't appear

2. **API Errors**:
   - Verify API keys are correctly set in .env files
   - Check Google Cloud Console for API quotas and limits
   - Ensure service account has necessary permissions

3. **Backend Connection**:
   - Verify Flask server is running on port 5000
   - Check CORS settings if getting connection errors
   - Ensure virtual environment is activated

## Development Tips

1. **Testing APIs**:
   - Use the built-in mock data for development
   - Test with small files first
   - Check console for detailed error messages

2. **Voice Navigation**:
   - Test in Chrome for best compatibility
   - Use clear voice commands
   - Check microphone settings

3. **Performance**:
   - Use development tools for monitoring
   - Check network tab for API calls
   - Monitor console for warnings/errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For issues and questions:
- Create an issue in the repository
- Check existing issues for solutions
- Review the troubleshooting guide