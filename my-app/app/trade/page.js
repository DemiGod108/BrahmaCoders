"use client";
import React, { useState } from "react";
import Navbar from "../components/Navbar";

// Mock data for now — later you'll fetch this from Pinata/IPFS
const mockNFTs = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  title: `AI Image #${i + 1}`,
  creator: `0x${Math.random().toString(16).slice(2, 10)}`,
  price: `${(Math.random() * 2).toFixed(2)} ETH`,
  image: `https://picsum.photos/400/400?random=${i + 1}`,
}));

export default function TradePage({ wallet, disconnectWallet, connectWallet, connecting }) {
  const [nfts] = useState(mockNFTs);

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      <Navbar
        wallet={wallet}
        disconnectWallet={disconnectWallet}
        connectWallet={connectWallet}
        connecting={connecting}
      />

      <div className="max-w-6xl mx-auto mt-10 p-6 space-y-6">
        <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-400">
          Marketplace
        </h2>
        <p className="text-neutral-400 max-w-lg">
          Browse AI-generated images available for sale. Connect your wallet to buy or sell.
        </p>

        {/* NFT Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {nfts.map((nft) => (
            <div
              key={nft.id}
              className="bg-neutral-800/60 border border-neutral-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
            >
              <img
                src={nft.image}
                alt={nft.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-emerald-400">{nft.title}</h3>
                <p className="text-xs text-neutral-400">Creator: {nft.creator}</p>
                <p className="font-semibold text-neutral-100">{nft.price}</p>
                <button className="mt-2 w-full px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold transition-colors">
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
