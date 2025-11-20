# 🎵 MusicAI - Claude + Spotify Music Recommendation System

A futuristic music recommendation system powered by Claude AI and Spotify that provides personalized song recommendations based on your mood and music preferences. Play previews directly in your browser without leaving the app!

![MusicAI](https://img.shields.io/badge/MusicAI-Claude%20%2B%20Spotify-purple)
![React](https://img.shields.io/badge/React-18+-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)

## ✨ Features

- **🎭 Mood-Based Recommendations**: Select from 8 different moods (Happy, Sad, Energetic, Chill, Motivated, Relaxed, Party, Heartbroken) to get personalized music suggestions
- **🤖 AI-Powered Algorithm**: Claude AI analyzes your music taste and mood to create algorithm-based recommendations similar to Spotify's Discover Weekly
- **🎧 In-Browser Playback**: Play 30-second previews directly in the browser - no need to open Spotify links
- **🔍 Spotify Search**: Direct search for songs, artists, and tracks
- **💬 Claude Chat**: Chat with Claude AI for music-related conversations
- **🎨 Modern UI**: Clean, futuristic design with glassmorphism effects and smooth interactions
- **📱 Responsive Design**: Works beautifully on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Anthropic API key
- Spotify Developer account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/musicAI-mcps.git
   cd musicAI-mcps
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client && npm install && cd ..
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Anthropic API Key (required)
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   
   # Spotify API Credentials (required)
   SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
   
   # Server Port (optional, defaults to 3000)
   PORT=3000
   ```

4. **Get API Keys**

   **Anthropic API Key:**
   - Visit [Anthropic Console](https://console.anthropic.com/)
   - Sign up or log in
   - Navigate to API Keys section
   - Create a new API key
   - Copy and paste into `.env` file

   **Spotify API Credentials:**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Log in with your Spotify account
   - Click "Create an app"
   - Fill in app details
   - Copy the Client ID and Client Secret
   - Paste into `.env` file

5. **Run the application**
   ```bash
   # Run both client and server concurrently
   npm run dev
   
   # Or run them separately:
   # Terminal 1 - Server
   npm run server
   
   # Terminal 2 - Client
   npm run client
   ```

6. **Open in browser**
   - Client: http://localhost:5173
   - Server: http://localhost:3000

## 📖 Usage

### Mood-Based Recommendations

1. Select **"Mood Recommendations"** mode (default)
2. Choose your current mood from the 8 available options
3. (Optional) Enter your music preferences (genres, favorite artists, etc.)
4. Click **"Get Algorithm-Based Recommendations"**
5. Claude AI will analyze your mood and preferences
6. Get personalized song recommendations with:
   - Play preview buttons (30-second previews)
   - Direct Spotify links
   - Album artwork
   - AI-generated explanations for each recommendation

### Spotify Search

1. Select **"Spotify Search"** mode
2. Type a song name, artist, or track
3. Get instant results with preview playback

### Claude Chat

1. Select **"Chat with Claude"** mode
2. Ask Claude anything about music
3. Get AI-powered responses

## 🏗️ Project Structure

```
musicAI-mcps/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.jsx        # Main application component
│   │   ├── App.css        # Styles
│   │   └── main.jsx       # Entry point
│   ├── public/            # Static assets
│   ├── package.json       # Client dependencies
│   └── vite.config.js     # Vite configuration
├── server/                 # Express backend
│   └── server.js          # MCP server implementation
├── package.json           # Root package configuration
├── .env                   # Environment variables (create this)
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## 🔌 API Endpoints

### Server Endpoints

- `GET /status` - Health check endpoint
  ```json
  {
    "status": "ok",
    "service": "Claude + Spotify MCP Server"
  }
  ```

- `POST /invoke` - Tool invocation endpoint
  ```json
  {
    "tool": "mood_recommendations" | "spotify_search" | "claude_chat",
    "input": "string or JSON string"
  }
  ```

### Available Tools

1. **mood_recommendations**: Get AI-powered music recommendations based on mood
2. **spotify_search**: Search for tracks on Spotify
3. **claude_chat**: Chat with Claude AI

## 🛠️ Technologies Used

- **Frontend:**
  - React 18+
  - Tailwind CSS
  - Vite
  - Axios

- **Backend:**
  - Node.js
  - Express.js
  - Anthropic Claude API
  - Spotify Web API

## 🎨 Features in Detail

### Mood Selection
Choose from 8 carefully curated moods, each with its own color scheme:
- 😊 Happy
- 😢 Sad
- 🔥 Energetic
- 😌 Chill
- 💪 Motivated
- 😴 Relaxed
- 🎉 Party
- 💔 Heartbroken

### Algorithm-Based Recommendations
The system uses Claude AI to:
- Analyze your music preferences
- Understand your current mood
- Generate recommendations similar to Spotify's algorithm
- Provide explanations for each song choice

### In-Browser Playback
- Play 30-second previews directly in the browser
- No need to open Spotify (unless you want the full track)
- Smooth audio controls
- "Now Playing" bar at the bottom

## 🐛 Troubleshooting

### Common Issues

**API Key Errors:**
- Make sure your `.env` file is in the root directory
- Verify your API keys are correct and active
- Check that there are no extra spaces in your `.env` file

**CORS Errors:**
- The server includes CORS middleware - this should work automatically
- If issues persist, check that the server is running on port 3000

**Port Conflicts:**
- Change the `PORT` in your `.env` file if 3000 is already in use
- Update the client API URL in `App.jsx` if you change the port

**Model Not Found Error:**
- The app uses `claude-3-haiku-20240307` by default
- If you have access to other models, update the model name in `server/server.js`

**No Preview Available:**
- Some tracks don't have preview URLs from Spotify
- Click the "Spotify" button to open the full track in Spotify

## 📝 Scripts

```bash
npm run dev      # Run both client and server
npm run server   # Run server only
npm run client   # Run client only
npm start        # Run server only (alias)
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- [Anthropic](https://www.anthropic.com/) for Claude AI
- [Spotify](https://www.spotify.com/) for the Spotify Web API
- [React](https://react.dev/) and [Tailwind CSS](https://tailwindcss.com/) for the amazing UI framework

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Made with ❤️ using Claude AI and Spotify
