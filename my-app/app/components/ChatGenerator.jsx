"use client";
import { useState, useRef, useEffect } from "react";
import { Image, Music, Video, Zap, Send, Loader2 } from "lucide-react";
import Navbar from "./Navbar";
import { ethers } from "ethers";

export default function UnifiedMediaGenerator() {
  const [wallet, setWallet] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("image");
  const [progress, setProgress] = useState(0);
  const chatEndRef = useRef(null);

  // Wallet connect
  const connectWallet = async () => {
    if (!window.ethereum) return alert("MetaMask not detected");
    setConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWallet(address);
    } catch (err) {
      console.error("Wallet connection error:", err);
      alert("Failed to connect wallet.");
    } finally {
      setConnecting(false);
    }
  };

  const disconnectWallet = () => setWallet(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Music progress simulation
  useEffect(() => {
    if (loading && mode === "music") {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 8;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [loading, mode]);

  // Send prompt
  const sendPrompt = async () => {
    if (!wallet) return alert("Connect wallet first!");
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input, mode };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setProgress(0);

    try {
      let endpoint = "/api/generate";
      let bodyKey = "prompt";

      if (mode === "music") {
        endpoint = "/api/generateMusic";
        bodyKey = "promptText";
      } else if (mode === "video") {
        endpoint = "/api/generateVideo";
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [bodyKey]: input }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        let aiMessage = { role: "ai", mode };

        if (mode === "image" && data.image) aiMessage.image = data.image;
        else if (mode === "music" && data.audioUrl) {
          aiMessage.audio = data.audioUrl;
          setProgress(100);
        } else if (mode === "video" && data.videoUrl) aiMessage.video = data.videoUrl;
        else aiMessage.content = `❌ ${data.error || "Failed to generate media."}`;

        if (!aiMessage.content) aiMessage.content = mode === "image" ? "Image generated:" : mode === "music" ? "Track composed!" : "Video ready:";
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        setMessages((prev) => [...prev, { role: "ai", content: `❌ ${data.error || "Something went wrong."}`, mode }]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "ai", content: "💀 Server error or no connection.", mode }]);
      setLoading(false);
    }
  };

  // Helpers
  const getModeIcon = (m) => (m === "image" ? <Image className="w-4 h-4" /> : m === "music" ? <Music className="w-4 h-4" /> : <Video className="w-4 h-4" />);
  const getModeText = (m) => (m === "image" ? "Image" : m === "music" ? "Music" : "Video");
  const getModePlaceholder = () =>
    mode === "image"
      ? "Describe the image you want to create..."
      : mode === "music"
      ? "Prompt for your track (e.g. 'chill lofi beat with jazz influences')"
      : "Describe the video scene and style...";

  // **Wallet gating**
  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-neutral-900 text-white">
        <div className="text-center mt-20">
          <Zap className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
          <h2 className="text-2xl font-bold mt-4">Connect your wallet to start creating</h2>
        </div>
        <Navbar wallet={wallet} connectWallet={connectWallet} disconnectWallet={disconnectWallet} connecting={connecting} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col text-white">
      <Navbar wallet={wallet} disconnectWallet={disconnectWallet} connecting={connecting} connectWallet={connectWallet} />

      <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-16 space-y-4">
              <Zap className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-neutral-300 text-xl font-medium">Unleash your creative potential.</p>
              <p className="text-neutral-500 text-sm">Select a media type below and input your prompt to generate AI art.</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-xl ${
                  msg.role === "user" ? "bg-emerald-600/90 text-white" : "bg-neutral-800/90 backdrop-blur-sm border border-neutral-700 text-neutral-200"
                }`}
              >
                {msg.role === "user" && (
                  <div className="text-xs flex items-center space-x-1 opacity-80 mb-1 font-semibold">
                    {getModeIcon(msg.mode)} <span>{getModeText(msg.mode)} Prompt</span>
                  </div>
                )}
                <p className="text-sm md:text-base whitespace-pre-wrap">{msg.content}</p>
                {msg.image && <img src={msg.image} alt="Generated" className="mt-4 rounded-xl w-full shadow-lg" />}
                {msg.audio && <audio controls src={msg.audio} className="mt-4 w-full rounded-lg" style={{ filter: "invert(1) grayscale(10%)" }} />}
                {msg.video && <video controls src={msg.video} className="mt-4 rounded-xl w-full shadow-lg" />}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[70%] bg-neutral-800/90 backdrop-blur-sm rounded-2xl p-4 border border-neutral-700">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                  <span className="text-neutral-400 text-sm">Generating your {mode}... Please wait.</span>
                </div>
                {mode === "music" && (
                  <div className="mt-3 space-y-1">
                    <div className="w-full bg-neutral-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-neutral-500 text-xs">Progress: {Math.min(99, Math.round(progress))}%</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-neutral-900/80 backdrop-blur-md border-t border-neutral-800 p-4 md:p-6 sticky bottom-0 z-10">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex gap-3 justify-center">
            {["image", "music", "video"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                disabled={loading}
                className={`flex items-center space-x-2 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  mode === m
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/30"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700/80 border border-neutral-700"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {m === "image" ? <Image className="w-4 h-4" /> : m === "music" ? <Music className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                <span>{m.charAt(0).toUpperCase() + m.slice(1)}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendPrompt()}
              placeholder={getModePlaceholder()}
              className="flex-1 bg-neutral-800/80 backdrop-blur-sm px-5 py-3.5 rounded-full outline-none text-sm md:text-base border border-neutral-700 focus:border-emerald-500 focus:bg-neutral-800 transition-all placeholder:text-neutral-500 text-white"
              disabled={loading}
            />
            <button
              onClick={sendPrompt}
              disabled={loading || !input.trim()}
              className={`p-3.5 rounded-full font-medium text-sm transition-all flex items-center justify-center ${
                loading || !input.trim() ? "bg-neutral-700 text-neutral-500 cursor-not-allowed" : "bg-emerald-500 text-black hover:bg-emerald-600 shadow-md shadow-emerald-500/30"
              }`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
