import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Enable CORS for all routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// API Keys
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// Validate required environment variables
if (!ANTHROPIC_API_KEY) {
  console.error("❌ ANTHROPIC_API_KEY is required. Please set it in your .env file");
  process.exit(1);
}

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  console.error(
    "❌ SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are required. Please set them in your .env file"
  );
  process.exit(1);
}

// ============================
// Spotify Auth (Client Credentials Flow)
// ============================
let spotifyToken = null;

async function getSpotifyToken() {
  const resp = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({ grant_type: "client_credentials" }).toString(),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString(
            "base64"
          ),
      },
    }
  );
  spotifyToken = resp.data.access_token;
  return spotifyToken;
}

// ============================
// MCP Endpoints
// ============================

// Health check
app.get("/status", (req, res) => {
  res.json({ status: "ok", service: "Claude + Spotify MCP Server" });
});

// Tool invocation
app.post("/invoke", async (req, res) => {
  try {
    const { tool, input } = req.body;

    // 1. Claude tool
    if (tool === "claude_chat") {
      const response = await axios.post(
        "https://api.anthropic.com/v1/messages",
        {
          model: "claude-3-haiku-20240307",
          max_tokens: 300,
          messages: [{ role: "user", content: input }],
        },
        {
          headers: {
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
          },
        }
      );
      return res.json({
        output: response.data.content[0].text,
      });
    }

    // 2. Spotify search tool
    if (tool === "spotify_search") {
      if (!spotifyToken) {
        await getSpotifyToken();
      }

      const resp = await axios.get("https://api.spotify.com/v1/search", {
        params: { q: input, type: "track", limit: 5 },
        headers: { Authorization: `Bearer ${spotifyToken}` },
      });

      const tracks = resp.data.tracks.items.map((t) => ({
        name: t.name,
        artist: t.artists.map((a) => a.name).join(", "),
        url: t.external_urls.spotify,
        image: t.album.images[0]?.url || t.album.images[1]?.url,
        preview: t.preview_url,
      }));

      return res.json({ output: tracks });
    }

    // 3. Claude-powered music recommendations based on mood
    if (tool === "mood_recommendations") {
      const { mood, preferences } = JSON.parse(input);
      
      // Get Spotify token
      if (!spotifyToken) {
        await getSpotifyToken();
      }

      // Ask Claude to analyze mood and suggest music based on algorithm
      const claudePrompt = `You are an advanced music algorithm expert. Analyze the user's music taste and create personalized recommendations.

User's mood: "${mood}"
User's music preferences: ${preferences || "Analyze their general music taste and create recommendations based on popular music algorithms"}

Based on music recommendation algorithms (like Spotify's, Apple Music's, etc.), analyze:
1. The user's likely music taste profile
2. Similar artists and tracks that match their preferences
3. Songs that align with their current mood while staying true to their taste
4. A mix of popular tracks and hidden gems that fit their algorithm

Suggest 10-12 specific songs that would appear in their personalized algorithm-based playlist for this mood.

Format your response as a JSON array of song recommendations, each with:
- songTitle: the exact song name
- artistName: the artist name
- reason: a brief explanation why this matches their mood AND their music algorithm/taste

Example format:
[
  {"songTitle": "Song Name", "artistName": "Artist Name", "reason": "This track matches your energetic vibe and aligns with your taste in [genre], similar to artists you likely enjoy"},
  ...
]

Return ONLY the JSON array, no other text.`;

      const claudeResponse = await axios.post(
        "https://api.anthropic.com/v1/messages",
        {
          model: "claude-3-haiku-20240307",
          max_tokens: 2000,
          messages: [{ role: "user", content: claudePrompt }],
        },
        {
          headers: {
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
          },
        }
      );

      const claudeText = claudeResponse.data.content[0].text;
      
      // Parse Claude's JSON response
      let recommendations;
      try {
        // Extract JSON from Claude's response (it might have markdown code blocks)
        const jsonMatch = claudeText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          recommendations = JSON.parse(jsonMatch[0]);
        } else {
          recommendations = JSON.parse(claudeText);
        }
      } catch (e) {
        // If parsing fails, return Claude's text as explanation
        return res.json({ 
          output: { 
            error: "Could not parse recommendations",
            claudeResponse: claudeText 
          } 
        });
      }

      // Search Spotify for each recommended song
      const spotifyTracks = [];
      for (const rec of recommendations.slice(0, 10)) {
        try {
          const searchQuery = `${rec.songTitle} ${rec.artistName}`;
          const spotifyResp = await axios.get("https://api.spotify.com/v1/search", {
            params: { q: searchQuery, type: "track", limit: 1 },
            headers: { Authorization: `Bearer ${spotifyToken}` },
          });

          if (spotifyResp.data.tracks.items.length > 0) {
            const track = spotifyResp.data.tracks.items[0];
            spotifyTracks.push({
              name: track.name,
              artist: track.artists.map((a) => a.name).join(", "),
              url: track.external_urls.spotify,
              image: track.album.images[0]?.url || track.album.images[1]?.url,
              reason: rec.reason,
              preview: track.preview_url,
            });
          }
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err) {
          console.error(`Error searching for ${rec.songTitle}:`, err.message);
        }
      }

      return res.json({ 
        output: {
          mood: mood,
          tracks: spotifyTracks,
          message: `Here are ${spotifyTracks.length} songs perfect for your ${mood} mood!`
        }
      });
    }

    return res.status(400).json({ error: "Unknown tool" });
  } catch (err) {
    console.error("Error details:", err.response?.data || err.message);
    const errorMessage = err.response?.data?.error?.message || err.response?.data?.error || err.message || "Invocation failed";
    res.status(500).json({ 
      error: "Invocation failed",
      details: errorMessage,
      fullError: process.env.NODE_ENV === "development" ? err.response?.data : undefined
    });
  }
});

// ============================
// Note: Claude does not have a built-in TTS API
// If you need TTS, consider using a third-party service like ElevenLabs or Google TTS
// ============================

app.listen(PORT, () => {
  console.log(`🚀 MCP server running on port ${PORT}`);
});
