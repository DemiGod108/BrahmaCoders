"use client";
import React from "react";
import { Wallet, X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * WalletButton component
 */
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

/**
 * Navbar component
 */
export default function Navbar({ wallet, disconnectWallet, connectWallet, connecting }) {
  const router = useRouter();

  return (
    <div className="bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 p-4 md:p-6 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto flex justify-between items-center gap-8">
        {/* Branding */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push("/")}>
          <Zap className="w-8 h-8 text-emerald-400" />
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-emerald-400">JAR</h1>
            <p className="text-neutral-500 text-xs md:text-sm mt-1">Create, Own, Evolve.</p>
          </div>
        </div>

        {/* Navigation Links (always visible) */}
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
        </div>

        {/* Wallet Section (optional) */}
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
