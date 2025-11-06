"use client";
import { useState, useRef, useEffect } from "react";
import { ethers } from "ethers";

export default function UnifiedMediaGenerator() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("image"); // "image", "music", or "video"
  const [progress, setProgress] = useState(0);
  const [wallet, setWallet] = useState(null);
  const chatEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

   // Connect MetaMask wallet
  const connectWallet = async () => {
    if (!window.ethereum) return alert("MetaMask not detected");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWallet(address);
    } catch (err) {
      console.error("Wallet connection error:", err);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => setWallet(null);

  // Simulate progress for music generation
  useEffect(() => {
    if (loading && mode === "music") {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [loading, mode]);

  const sendPrompt = async () => {
    if (!wallet) {
      alert("Please connect your wallet first!");
      return;
    }
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

        if (mode === "image" && data.image) {
          aiMessage.content = "Here's your image:";
          aiMessage.image = data.image;
        } else if (mode === "music" && data.audioUrl) {
          aiMessage.content = "✅ Track composed successfully!";
          aiMessage.audio = data.audioUrl;
          setProgress(100);
        } else if (mode === "video" && data.videoUrl) {
          aiMessage.content = "Your video is ready:";
          aiMessage.video = data.videoUrl;
        } else {
          aiMessage.content = `❌ ${data.error || "Failed to generate media."}`;
        }

        setMessages((prev) => [...prev, aiMessage]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: `❌ ${data.error || "Something went wrong."}`,
            mode,
          },
        ]);
      }
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "💀 Server error or no connection.",
          mode,
        },
      ]);
      setLoading(false);
    }
  };

  const getModeIcon = (m) => {
    if (m === "image") return "🖼️";
    if (m === "music") return "🎵";
    if (m === "video") return "🎥";
  };

  const getModePlaceholder = () => {
    if (mode === "image") return "Describe your image...";
    if (mode === "music") return "Describe your track (e.g. 'chill lofi beat')";
    if (mode === "video") return "Describe your video...";
  };

 if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <p className="mb-4 text-lg">Connect your MetaMask wallet to continue</p>
        <button
          onClick={connectWallet}
          className="px-6 py-3 rounded-full bg-black text-white font-medium"
        >
          Connect Wallet
        </button>
      </div>
    );
  }


  return (
    
    <div className="min-h-screen bg-gradient-to-br from-lime-50 via-stone-100 to-amber-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-stone-200/50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl md:text-4xl font-bold text-stone-900 text-center">
            ✨ AI Media Generator
          </h1>
          <p className="text-stone-600 text-sm text-center mt-2">
            Create images, music, and videos with AI
          </p>
          <button
          onClick={disconnectWallet}
          className="px-4 py-2 rounded-full bg-red-500 text-white text-sm"
        >
          Disconnect
        </button>
        </div>
      </div>
          
      

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 space-y-3">
              <div className="text-6xl mb-4">🎨</div>
              <p className="text-stone-600 text-lg">
                Select a mode and start creating!
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 ${
                  msg.role === "user"
                    ? "bg-black text-lime-50"
                    : "bg-white/70 backdrop-blur-sm border border-stone-200/50 text-stone-900"
                }`}
              >
                {msg.role === "user" && (
                  <div className="text-xs opacity-70 mb-1">
                    {getModeIcon(msg.mode)} {msg.mode}
                  </div>
                )}
                <p className="text-sm md:text-base whitespace-pre-wrap">
                  {msg.content}
                </p>

                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Generated"
                    className="mt-3 rounded-xl w-full"
                  />
                )}

                {msg.audio && (
                  <audio
                    controls
                    src={msg.audio}
                    className="mt-3 w-full rounded-xl"
                    style={{
                      filter: "hue-rotate(45deg) saturate(0.8)",
                    }}
                  />
                )}

                {msg.video && (
                  <video
                    controls
                    src={msg.video}
                    className="mt-3 rounded-xl w-full"
                  />
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[70%] bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-stone-200/50">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-lime-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-lime-500 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-lime-500 rounded-full animate-bounce delay-200"></div>
                  </div>
                  <span className="text-stone-600 text-sm">
                    Generating your {mode}...
                  </span>
                </div>
                {mode === "music" && (
                  <div className="mt-3 space-y-1">
                    <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-lime-400 to-lime-500 transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <p className="text-stone-500 text-xs">
                      {Math.round(progress)}% complete
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white/60 backdrop-blur-sm border-t border-stone-200/50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Mode Selection Buttons */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setMode("image")}
              disabled={loading}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                mode === "image"
                  ? "bg-black text-lime-50 shadow-md"
                  : "bg-white/70 text-stone-700 hover:bg-white border border-stone-200/50"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              🖼️ Image
            </button>
            <button
              onClick={() => setMode("music")}
              disabled={loading}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                mode === "music"
                  ? "bg-black text-lime-50 shadow-md"
                  : "bg-white/70 text-stone-700 hover:bg-white border border-stone-200/50"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              🎵 Music
            </button>
            <button
              onClick={() => setMode("video")}
              disabled={loading}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                mode === "video"
                  ? "bg-black text-lime-50 shadow-md"
                  : "bg-white/70 text-stone-700 hover:bg-white border border-stone-200/50"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              🎥 Video
            </button>
          </div>

          {/* Input Bar */}
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendPrompt()}
              placeholder={getModePlaceholder()}
              className="flex-1 bg-white/70 backdrop-blur-sm px-5 py-3.5 rounded-full outline-none text-sm md:text-base border border-stone-300/60 focus:border-lime-400 focus:bg-white transition-all placeholder:text-stone-400 text-black"
              disabled={loading}
            />
            <button
              onClick={sendPrompt}
              disabled={loading || !input.trim()}
              className={`px-6 py-3.5 rounded-full font-medium text-sm transition-all ${
                loading || !input.trim()
                  ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                  : "bg-black text-lime-50 hover:bg-stone-900 hover:shadow-md"
              }`}
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
