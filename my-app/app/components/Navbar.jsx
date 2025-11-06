"use client";
import React, { useState, useEffect } from "react";
import { Wallet, X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

// Wallet button component
const WalletButton = ({ address, disconnectWallet }) => {
  const shortAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  return (
    <div className="flex items-center space-x-2 p-2 bg-neutral-800 rounded-full text-neutral-300 text-sm border border-neutral-700">
      <Wallet className="w-4 h-4 text-emerald-400" />
      <span>{shortAddress}</span>
      <button
        onClick={disconnectWallet}
        className="ml-2 p-1 rounded-full bg-neutral-700/80 hover:bg-neutral-600 transition-colors"
        aria-label="Disconnect Wallet"
      >
        <X className="w-3 h-3 text-neutral-400" />
      </button>
    </div>
  );
};

// Navbar component
export default function Navbar() {
  const router = useRouter();
  const [wallet, setWallet] = useState(null);
  const [connecting, setConnecting] = useState(false);

  const connectWallet = async () => {
  if (!window.ethereum) return alert("MetaMask not detected");
  setConnecting(true);
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    const address = accounts[0];
    setWallet(address);
    localStorage.setItem("walletAddress", address);
    window.location.reload(); // ← reload page after connecting
  } catch (err) {
    console.error(err);
  } finally {
    setConnecting(false);
  }
};


  const disconnectWallet = () => {
  setWallet(null);
  localStorage.removeItem("walletAddress");
  window.location.reload(); // reload page after disconnect
};


  useEffect(() => {
    const stored = localStorage.getItem("walletAddress");
    if (stored) setWallet(stored);

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) disconnectWallet();
        else {
          setWallet(accounts[0]);
          localStorage.setItem("walletAddress", accounts[0]);
        }
      });
    }
  }, []);

  return (
    <div className="bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 p-4 md:p-6 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto flex justify-between items-center gap-8">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push("/")}>
          <Zap className="w-8 h-8 text-emerald-400" />
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-400">JAR</h1>
            <p className="text-neutral-500 text-xs md:text-sm mt-1">Create, Own, Evolve.</p>
          </div>
        </div>

        <div className="hidden md:flex space-x-8">
          <button
            onClick={() => router.push("/")}
            className="px-3 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            Gen
          </button>
          <button
            onClick={() => router.push("/verify")}
            className="px-3 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            Verify
          </button>
          <button
            onClick={() => router.push("/trade")}
            className="px-3 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            Trade
          </button>
          <button
            onClick={() => router.push("/certificates")}
            className="px-3 py-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
          >
            Certificates
          </button>
        </div>

        {wallet ? (
          <WalletButton address={wallet} disconnectWallet={disconnectWallet} />
        ) : (
          <button
            onClick={connectWallet}
            disabled={connecting}
            className={`flex items-center space-x-2 px-6 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold transition-colors shadow-lg ${
              connecting ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span>{connecting ? "Connecting..." : "Connect Wallet"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
