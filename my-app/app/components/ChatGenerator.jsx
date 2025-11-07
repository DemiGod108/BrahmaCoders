"use client";
import { useState, useRef, useEffect } from "react";
import { Image, Music, Video, Zap, Send, Loader2 } from "lucide-react";

export default function ChatGenerator({ wallet }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("image");
  const [progress, setProgress] = useState(0);
  const chatEndRef = useRef(null);

  // Store last generated media + metadata
  const [lastGenerated, setLastGenerated] = useState(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (loading && mode === "music") {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? prev : prev + Math.random() * 8));
      }, 300);
      return () => clearInterval(interval);
    }
  }, [loading, mode]);

  // Convert data → blob for upload
  const toBlob = async (data, type) => {
    if (type === "image") {
      const parts = data.split(";base64,");
      const mime = parts[0].split(":")[1];
      const binary = atob(parts[1]);
      const array = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
      return new Blob([array], { type: mime });
    }
    const res = await fetch(data);
    return await res.blob();
  };

  // Claim Ownership Action
  const claimAsset = async () => {
    if (!wallet) return alert("Connect wallet first.");
    if (!lastGenerated) return alert("Generate something first.");

    const { type, fileData, prompt, model, timestamp } = lastGenerated;
    const blob = await toBlob(fileData, type);

    const formData = new FormData();
    formData.append("wallet", wallet);
    formData.append("prompt", prompt);
    formData.append("model", model);
    formData.append("timestamp", timestamp);
    formData.append("file",
      blob,
      `claimed.${type === "image" ? "png" : type === "music" ? "mp3" : "mp4"}`
    );

    const res = await fetch("http://localhost:4000/upload", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    if (data.status === "MINTED") {
      alert(`✅ NFT Minted! Token ID: ${data.tokenId}`);
    } else if (data.status === "DUPLICATE") {
      alert(`⚠ Already Owned!\nOwner: ${data.owner}\nToken ID: ${data.tokenId}`);
    } else {
      alert(`⚠ ${data.error || "Failed"}`);
    }
  };

  // Send prompt
  const sendPrompt = async () => {
    if (!wallet) return alert("Connect wallet first");
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
        body: JSON.stringify({ [bodyKey]: userMessage.content })
      });

      const data = await res.json();
      setLoading(false);

      let aiMessage = { role: "ai", mode };

      // --- Store generated output and metadata ---
      if (res.ok) {
        if (mode === "image" && data.image) {
          aiMessage.image = data.image;
          setLastGenerated({
            type: "image",
            fileData: data.image,
            prompt: userMessage.content,
            model: "AI-Image",
            timestamp: Date.now()
          });
        }
        else if (mode === "music" && data.audioUrl) {
          aiMessage.audio = data.audioUrl;
          setLastGenerated({
            type: "music",
            fileData: data.audioUrl,
            prompt: userMessage.content,
            model: "AI-Music",
            timestamp: Date.now()
          });
        }
        else if (mode === "video" && data.videoUrl) {
          aiMessage.video = data.videoUrl;
          setLastGenerated({
            type: "video",
            fileData: data.videoUrl,
            prompt: userMessage.content,
            model: "AI-Video",
            timestamp: Date.now()
          });
        }
        else {
          aiMessage.content = `❌ ${data.error || "Generation failed."}`;
        }

        if (!aiMessage.content)
          aiMessage.content =
            mode === "image" ? "Image generated:" :
            mode === "music" ? "Track composed!" :
            "Video ready:";
      } else {
        aiMessage.content = `❌ ${data.error || "Server error."}`;
      }

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [...prev, { role: "ai", content: "💀 Server Error.", mode }]);
      setLoading(false);
    }
  };

  const getModeIcon = (m) => m === "image" ? <Image className="w-4 h-4"/> :
                            m === "music" ? <Music className="w-4 h-4"/> :
                                            <Video className="w-4 h-4"/>;
  const getModeText = (m) => m.charAt(0).toUpperCase() + m.slice(1);

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col text-white">

      <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-8">
        <div className="max-w-4xl mx-auto space-y-6">

          {messages.length === 0 && (
            <div className="text-center py-16 space-y-4">
              <Zap className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-neutral-300 text-xl font-medium">Unleash your creativity.</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-xl ${
                  msg.role === "user"
                    ? "bg-emerald-600/90 text-white"
                    : "bg-neutral-800/90 border border-neutral-700"
                }`}
              >
                <p className="text-sm md:text-base whitespace-pre-wrap">{msg.content}</p>

                {msg.image && (
                  <>
                    <img src={msg.image} className="mt-4 rounded-xl w-full shadow" />
                    <button onClick={claimAsset}
                      className="mt-3 bg-emerald-500 hover:bg-emerald-600 px-3 py-1 rounded-md text-xs">
                      Claim Ownership
                    </button>
                  </>
                )}

                {msg.audio && (
                  <>
                    <audio controls src={msg.audio} className="mt-4 w-full rounded-lg" />
                    <button onClick={claimAsset}
                      className="mt-3 bg-emerald-500 hover:bg-emerald-600 px-3 py-1 rounded-md text-xs">
                      Claim Ownership
                    </button>
                  </>
                )}

                {msg.video && (
                  <>
                    <video controls src={msg.video} className="mt-4 rounded-xl w-full" />
                    <button onClick={claimAsset}
                      className="mt-3 bg-emerald-500 hover:bg-emerald-600 px-3 py-1 rounded-md text-xs">
                      Claim Ownership
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[70%] bg-neutral-800 p-4 rounded-xl border border-neutral-700">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* MODE SELECT */}
      <div className="bg-neutral-900 border-t border-neutral-800 p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto space-y-4">

          <div className="flex gap-3 justify-center">
            {["image", "music", "video"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                disabled={loading}
                className={`flex items-center space-x-2 px-5 py-2 rounded-full text-sm ${
                  mode === m ? "bg-emerald-500 text-black" : "bg-neutral-800 border border-neutral-700"
                }`}
              >
                {getModeIcon(m)}
                <span>{getModeText(m)}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendPrompt()}
              placeholder={wallet ? "Enter your prompt..." : "Connect wallet..."}
              className="flex-1 bg-neutral-800 px-5 py-3.5 rounded-full border border-neutral-700"
              disabled={!wallet || loading}
            />

            <button
              onClick={sendPrompt}
              disabled={!wallet || loading || !input.trim()}
              className="p-3.5 bg-emerald-500 text-black rounded-full"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Send />}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
