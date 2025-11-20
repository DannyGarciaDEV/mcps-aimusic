import { useState, useRef, useEffect } from "react";
import axios from "axios";

const MOODS = [
  { emoji: "😊", label: "Happy", color: "from-yellow-400 to-orange-500" },
  { emoji: "😢", label: "Sad", color: "from-blue-400 to-indigo-600" },
  { emoji: "🔥", label: "Energetic", color: "from-red-500 to-pink-600" },
  { emoji: "😌", label: "Chill", color: "from-green-400 to-teal-500" },
  { emoji: "💪", label: "Motivated", color: "from-purple-500 to-pink-500" },
  { emoji: "😴", label: "Relaxed", color: "from-indigo-400 to-purple-500" },
  { emoji: "🎉", label: "Party", color: "from-orange-500 to-red-500" },
  { emoji: "💔", label: "Heartbroken", color: "from-gray-400 to-gray-600" },
];

export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("mood_recommendations");
  const [selectedMood, setSelectedMood] = useState(null);
  const [preferences, setPreferences] = useState("");
  const [loading, setLoading] = useState(false);
  const [playingTrack, setPlayingTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setPlayingTrack(null);
      });
    }
  }, []);

  const playTrack = (track) => {
    if (playingTrack?.name === track.name && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (track.preview) {
        setPlayingTrack(track);
        setIsPlaying(true);
        if (audioRef.current) {
          audioRef.current.src = track.preview;
          audioRef.current.play().catch(e => {
            console.error("Play error:", e);
            setIsPlaying(false);
          });
        }
      } else {
        window.open(track.url, '_blank');
      }
    }
  };

  const handleMoodRecommendations = async () => {
    if (!selectedMood) {
      const errorMsg = {
        sender: "bot",
        text: "Please select a mood first!",
        type: "error",
      };
      setMessages((prev) => [...prev, errorMsg]);
      return;
    }

    setLoading(true);
    const userMessage = {
      sender: "user",
      text: `Get recommendations for ${selectedMood.label} mood`,
      mood: selectedMood,
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await axios.post("http://localhost:3000/invoke", {
        tool: "mood_recommendations",
        input: JSON.stringify({
          mood: selectedMood.label,
          preferences: preferences || "general music taste",
        }),
      });

      const botMessage = {
        sender: "bot",
        text: res.data.output,
        type: "recommendations",
        mood: selectedMood,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMsg = {
        sender: "bot",
        text: "⚠️ Error: " + (err.response?.data?.error || err.message),
        type: "error",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3000/invoke", {
        tool: mode,
        input,
      });

      const botMessage = {
        sender: "bot",
        text: res.data.output,
        type: mode === "spotify_search" ? "tracks" : "text",
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMsg = {
        sender: "bot",
        text: "⚠️ Error: " + (err.response?.data?.error || err.message),
        type: "error",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  const renderMessage = (msg, i) => {
    if (msg.type === "recommendations" && msg.text?.tracks) {
      return (
        <div key={i} className="w-full mb-6">
          <div className="bg-gradient-to-br from-purple-600/30 via-pink-600/30 to-orange-500/30 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{msg.mood?.emoji || "🎵"}</span>
              <div>
                <h3 className="text-xl font-bold text-white">{msg.text.message}</h3>
                <p className="text-white/70 text-sm">Algorithm-based recommendations</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {msg.text.tracks.map((track, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 hover:bg-white/15"
                >
                  <div className="flex gap-4">
                    {track.image && (
                      <div className="relative">
                        <img
                          src={track.image}
                          alt={track.name}
                          className="w-20 h-20 rounded-lg object-cover shadow-md"
                        />
                        {track.preview && (
                          <button
                            onClick={() => playTrack(track)}
                            className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100"
                          >
                            {playingTrack?.name === track.name && isPlaying ? (
                              <span className="text-white text-2xl">⏸</span>
                            ) : (
                              <span className="text-white text-2xl">▶</span>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-sm mb-1">{track.name}</h4>
                      <p className="text-white/70 text-xs mb-2">{track.artist}</p>
                      {track.reason && (
                        <p className="text-white/60 text-xs mb-3 italic line-clamp-2">
                          {track.reason}
                        </p>
                      )}
                      <div className="flex gap-2">
                        {track.preview ? (
                          <button
                            onClick={() => playTrack(track)}
                            className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-semibold hover:from-purple-400 hover:to-pink-400"
                          >
                            {playingTrack?.name === track.name && isPlaying ? "⏸ Pause" : "▶ Play"}
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 bg-gray-500/50 text-white rounded-lg text-xs font-semibold">
                            No Preview
                          </span>
                        )}
                        <a
                          href={track.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-white/20 text-white rounded-lg text-xs font-semibold hover:bg-white/30 border border-white/30"
                        >
                          🎧 Spotify
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (msg.type === "tracks" && Array.isArray(msg.text)) {
      return (
        <div key={i} className="w-full mb-4">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4">
            {msg.text.map((track, idx) => (
              <div key={idx} className="mb-4 last:mb-0">
                <div className="flex gap-3 items-center">
                  {track.image && (
                    <img
                      src={track.image}
                      alt={track.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-white">{track.name}</h4>
                    <p className="text-white/70 text-sm">{track.artist}</p>
                    {track.preview && (
                      <button
                        onClick={() => playTrack(track)}
                        className="mt-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs font-semibold hover:from-purple-400 hover:to-pink-400"
                      >
                        {playingTrack?.name === track.name && isPlaying ? "⏸ Pause" : "▶ Play"}
                      </button>
                    )}
                    <a
                      href={track.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-300 hover:text-purple-200 text-sm font-semibold ml-2"
                    >
                      Spotify →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div
        key={i}
        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} mb-4`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl shadow-md ${
            msg.sender === "user"
              ? "bg-gradient-to-r from-blue-500/80 to-purple-600/80 text-white"
              : msg.type === "error"
              ? "bg-red-500/20 text-red-200 border border-red-500/30"
              : "bg-white/10 text-white border border-white/20"
          }`}
        >
          {typeof msg.text === "string" ? msg.text : JSON.stringify(msg.text)}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600/40 via-pink-600/40 to-orange-500/40 backdrop-blur-xl border border-white/30 text-white p-6 md:p-8 rounded-2xl shadow-xl mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">🎵 MusicAI</h1>
              <p className="text-white/90 text-sm md:text-base">Powered by Claude AI + Spotify Algorithm</p>
            </div>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="bg-white/20 backdrop-blur-sm text-white border-white/30 rounded-xl px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="mood_recommendations">🎭 Mood Recommendations</option>
              <option value="spotify_search">🔍 Spotify Search</option>
              <option value="claude_chat">💬 Chat with Claude</option>
            </select>
          </div>
        </div>

        {/* Mood Selector */}
        {mode === "mood_recommendations" && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 md:p-8 shadow-xl mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">🎭</span>
              How are you feeling?
            </h2>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-6">
              {MOODS.map((mood) => (
                <button
                  key={mood.label}
                  onClick={() => setSelectedMood(mood)}
                  className={`p-4 rounded-xl ${
                    selectedMood?.label === mood.label
                      ? `bg-gradient-to-br ${mood.color} text-white shadow-lg`
                      : "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                  }`}
                >
                  <div className="text-3xl md:text-4xl mb-2">{mood.emoji}</div>
                  <div className="text-xs font-semibold">{mood.label}</div>
                </button>
              ))}
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
                <span>🎧</span>
                Your Music Preferences (helps our algorithm)
              </label>
              <input
                type="text"
                value={preferences}
                onChange={(e) => setPreferences(e.target.value)}
                placeholder="e.g., indie rock, jazz, electronic, or favorite artists..."
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleMoodRecommendations}
              disabled={!selectedMood || loading}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Analyzing your algorithm...</span>
                </span>
              ) : (
                <span>🎵 Get Algorithm-Based Recommendations</span>
              )}
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl mb-6 min-h-[400px] max-h-[700px] overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-white/60 mt-20">
              <div className="text-6xl mb-4">🎵</div>
              <p className="text-xl md:text-2xl font-semibold">Select a mood to get personalized recommendations!</p>
              <p className="text-sm mt-2 text-white/50">Powered by advanced music algorithms</p>
            </div>
          ) : (
            <div className="space-y-4">{messages.map((msg, i) => renderMessage(msg, i))}</div>
          )}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {/* Input */}
        {(mode === "spotify_search" || mode === "claude_chat") && (
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl flex gap-3">
            <input
              className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === "spotify_search"
                  ? "Search for songs, artists..."
                  : "Chat with Claude..."
              }
              onKeyDown={(e) => e.key === "Enter" && !loading && sendMessage()}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        )}

        {/* Audio Player */}
        <audio ref={audioRef} />
        
        {/* Now Playing Bar */}
        {playingTrack && (
          <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-purple-600/95 via-pink-600/95 to-orange-500/95 backdrop-blur-xl border-t border-white/20 p-4 shadow-2xl z-50">
            <div className="max-w-6xl mx-auto flex items-center gap-4">
              {playingTrack.image && (
                <img src={playingTrack.image} alt={playingTrack.name} className="w-12 h-12 rounded-lg" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{playingTrack.name}</p>
                <p className="text-white/80 text-sm truncate">{playingTrack.artist}</p>
              </div>
              <button
                onClick={() => {
                  audioRef.current?.pause();
                  setIsPlaying(false);
                  setPlayingTrack(null);
                }}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
