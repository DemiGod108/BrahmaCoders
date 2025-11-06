"use client";
import { useState } from "react";

export default function TextToVideo() {
  const [prompt, setPrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateVideo = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setVideoUrl(null);

    try {
      const res = await fetch("/api/generateVideo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.videoUrl) {
        setVideoUrl(data.videoUrl);
      } else {
        alert(data.error || "Failed to generate video.");
      }
    } catch (err) {
      console.error(err);
      alert("Network/server error.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center p-6 space-y-6">
      <h1 className="text-3xl font-bold">🎥 Pollo AI Text → Video Generator</h1>

      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the video (e.g. 'a dog dancing in neon lights')"
        className="w-full max-w-lg bg-gray-800 p-3 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
        disabled={loading}
      />

      <button
        onClick={generateVideo}
        disabled={loading}
        className={`w-full max-w-lg px-6 py-3 rounded-lg font-bold text-lg transition ${
          loading
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "🎬 Generating..." : "Generate Video"}
      </button>

      {videoUrl && (
        <div className="mt-6 bg-gray-800 p-5 rounded-xl shadow-lg w-full max-w-lg text-center">
          <h2 className="text-xl font-semibold mb-2">Your Video:</h2>
          <video controls src={videoUrl} className="w-full rounded-lg" />
        </div>
      )}
    </div>
  );
}
