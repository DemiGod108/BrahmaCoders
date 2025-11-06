"use client";
import { useState, useEffect } from "react";
import ChatGenerator from "../app/components/ChatGenerator";
import Navbar from "../app/components/Navbar";

export default function HomePage() {
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("walletAddress");
    if (stored) setWallet(stored);

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) setWallet(null);
        else {
          setWallet(accounts[0]);
          localStorage.setItem("walletAddress", accounts[0]);
        }
      });
    }
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <ChatGenerator wallet={wallet} />
    </main>
  );
}
