"use client";
import { useState, useRef, useEffect } from "react";

export default function Chat() {
  const [messages, setMessages] = useState([]); // chat messages
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendPrompt = async () => {
    if (!input.trim() || loading) return;
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.image) {
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: "Here's your image:", image: data.image },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: `❌ ${data.error || "Something went wrong."}` },
        ]);
      }
    } catch (err) {
      console.error("Error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "💀 Server error or no connection." },
      ]);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-lime-50 via-stone-100 to-amber-50">
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] md:max-w-[75%] ${
                  msg.role === "user"
                    ? "bg-black text-lime-50 px-5 py-3 rounded-3xl shadow-sm"
                    : "bg-white/60 backdrop-blur-sm text-stone-800 px-5 py-3 rounded-3xl border border-stone-200/50 shadow-sm"
                }`}
              >
                <p className="text-sm md:text-base leading-relaxed">{msg.content}</p>
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Generated"
                    className="mt-4 rounded-2xl w-full shadow-md border border-stone-200"
                  />
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/60 backdrop-blur-sm text-stone-500 px-5 py-3 rounded-3xl text-sm border border-stone-200/50">
                Generating your masterpiece...
              </div>
            </div>
          )}
          <div ref={chatEndRef}></div>
        </div>
      </div>

      <div className="border-t border-stone-300/50 bg-white/40 backdrop-blur-md">
        <div className="max-w-3xl mx-auto p-4 md:p-6">
          <div className="flex gap-3 items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendPrompt()}
              placeholder="Describe your vision..."
              className="flex-1 bg-white/70 backdrop-blur-sm px-5 py-3.5 rounded-full outline-none text-sm md:text-base border border-stone-300/60 focus:border-lime-400 focus:bg-white transition-all placeholder:text-stone-400 text-black"
              disabled={loading}
            />
            <button
              onClick={sendPrompt}
              disabled={loading}
              className={`px-7 py-3.5 rounded-full text-sm font-medium transition-all shadow-sm ${
                loading
                  ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                  : "bg-black text-lime-50 hover:bg-stone-900 hover:shadow-md"
              }`}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}