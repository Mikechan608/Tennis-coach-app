Tennis AI Coach AppOverviewThis is a React-based web application that analyzes tennis stroke videos using Google's Gemini API. It provides scores for power, technique, and consistency on forehand and backhand strokes, along with coaching feedback and tips. Built with Vite for fast development, it's ideal for tennis players looking to improve their skills through AI insights.FeaturesVideo upload and analysis with Gemini AI for multi-stroke detection (forehand/backhand).
Scores displayed in tabs with power, consistency, and technique metrics.
Session history with averages and dates.
Playback controls (speed toggle) and local storage for persistence.
Secure API key input and error handling.

Setup InstructionsClone the repo: git clone https://github.com/Mikechan608/Tennis-coach-app/
Navigate to the folder: cd tennis-ai-coach
Install dependencies: npm install
Get a Gemini API key from aistudio.google.com/app/apikey.
Run locally: npm run dev (opens at http://localhost:5173).on Vercel platform: https://tennis-coach-app.vercel.app/
Paste your API key in the app's input field.

UsageEnter your Gemini API key.
Click "+ New Session" to upload a short tennis video (MP4 recommended, <30 seconds).
View analysis in tabs: Switch between forehand/backhand for scores and feedback.
History sidebar shows past sessions—click to reload.

Future IdeasMobile version with React Native.
Integration with more AI models (e.g., for pose estimation).
User authentication and cloud storage for sessions.
Charts for score trends over time.

Built by Rudia Chen– Contributions welcome!

