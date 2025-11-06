"use client";
import { useState, useEffect } from "react";

export default function MusicGenerator() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);

  // Simulate progress when generating
  useEffect(() => {
    if (loading) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [loading]);

  const generateMusic = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setAudioUrl(null);
    setProgress(0);
    setStatus("🎶 Starting composition...");

    try {
      const res = await fetch("/api/generateMusic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promptText: prompt }),
      });

      const data = await res.json();

      if (res.ok && data.audioUrl) {
        setProgress(100);
        setAudioUrl(data.audioUrl);
        setStatus("✅ Track composed successfully!");
      } else {
        setStatus(`❌ ${data.error || "Failed to generate music."}`);
      }
    } catch (err) {
      console.error(err);
      setStatus("💀 Network/server error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-stone-100 to-amber-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-stone-900">
            🎵 Music Generator
          </h1>
          <p className="text-stone-600 text-sm md:text-base">
            Transform your words into melodies
          </p>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-stone-200/50 shadow-lg space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-stone-700 block">
              Describe your track
            </label>
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && generateMusic()}
              placeholder="e.g. 'chill lofi beat for coding'"
              className="w-full bg-white/70 backdrop-blur-sm px-5 py-4 rounded-2xl border border-stone-300/60 focus:border-lime-400 focus:bg-white outline-none transition-all placeholder:text-stone-400 text-stone-900"
              disabled={loading}
            />
          </div>

          <button
            onClick={generateMusic}
            disabled={loading}
            className={`w-full px-6 py-4 rounded-2xl font-medium text-base transition-all shadow-sm ${
              loading
                ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                : "bg-black text-lime-50 hover:bg-stone-900 hover:shadow-md"
            }`}
          >
            {loading ? "🎧 Composing..." : "Generate Music"}
          </button>

          {loading && (
            <div className="space-y-2">
              <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-lime-400 to-lime-500 transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-stone-600 text-sm text-center">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}

          {status && !loading && (
            <div className="text-center">
              <p className="text-stone-700 text-sm bg-stone-100/50 rounded-xl py-2 px-4 inline-block">
                {status}
              </p>
            </div>
          )}
        </div>

        {audioUrl && (
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 border border-stone-200/50 shadow-lg space-y-4">
            <h2 className="text-xl font-semibold text-stone-900 text-center">
              Your Track
            </h2>
            <audio
              controls
              src={audioUrl}
              className="w-full rounded-2xl"
              style={{
                filter: "hue-rotate(45deg) saturate(0.8)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}