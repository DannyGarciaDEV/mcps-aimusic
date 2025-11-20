# MusicAI MCP Server

A Model Context Protocol (MCP) server that combines Claude (Anthropic) and Spotify functionality in a React web application.

## Features

- **Claude Integration**: Chat with Anthropic's Claude 3.5 Sonnet model
- **Spotify Search**: Search for tracks and get direct links to Spotify
- **Modern UI**: Built with React and Tailwind CSS
- **Real-time Communication**: Web-based chat interface

## Setup

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Anthropic API Key
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Spotify API Credentials
SPOTIFY_CLIENT_ID=your_spotify_client_id_here
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# Server Port (optional)
PORT=3000
```

### 3. Get API Keys

#### Anthropic API Key
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new API key

#### Spotify API Credentials
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Create a new app
4. Copy the Client ID and Client Secret

### 4. Run the Application

```bash
# Run both client and server concurrently
npm run dev

# Or run them separately:
# Terminal 1 - Server
npm run server

# Terminal 2 - Client
npm run client
```

The application will be available at:
- **Client**: http://localhost:5173 (Vite dev server)
- **Server**: http://localhost:3000 (Express server)

## Usage

1. Open the web application in your browser
2. Select between "Claude" and "Spotify" modes using the dropdown
3. Type your message and press Enter or click Send
4. For Spotify mode, search for songs and click the "Listen" links to open in Spotify

## API Endpoints

- `GET /status` - Health check
- `POST /invoke` - Tool invocation endpoint

## Project Structure

```
musicAI-mcps/
├── client/          # React frontend
│   ├── src/
│   │   ├── App.jsx  # Main application component
│   │   └── ...
│   └── package.json
├── server/          # Express backend
│   └── server.js    # MCP server implementation
├── package.json     # Root package configuration
└── .env            # Environment variables (create this)
```

## Troubleshooting

- **CORS errors**: The server includes CORS middleware to allow cross-origin requests
- **API key errors**: Make sure your `.env` file is properly configured with valid API keys
- **Port conflicts**: Change the PORT in `.env` if 3000 is already in use
# mcps-aimusic
