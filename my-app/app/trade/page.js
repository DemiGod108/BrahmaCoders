"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function TradePage() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/list")
      .then((res) => res.json())
      .then((data) => {
        setNfts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center p-6 text-white">Loading artworks...</div>;

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      <Navbar />

      <div className="max-w-6xl mx-auto mt-10 p-6 space-y-6">
        <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-400">
          Certified AI Artworks
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {nfts.map((nft) => (
            <div key={nft.id} className="bg-neutral-800/60 border border-neutral-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow">
              <img src={nft.image} alt="art" className="w-full h-64 object-cover" />

             <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-emerald-400">Token #{nft.tokenId}</h3>

                  <p className="text-xs text-neutral-400">Creator: {nft.wallet}</p>

                  <p className="text-xs text-neutral-500">
                    Timestamp: {nft.createdAt ? new Date(nft.createdAt).toLocaleString() : "N/A"}
                  </p>

                  <p className="font-semibold text-emerald-300">{nft.price}</p>

                  <a
                    href={nft.metadataURL}
                    target="_blank"
                    className="text-emerald-400 text-xs underline"
                  >
                    View Metadata
                  </a>

                  <button
                    disabled={!localStorage.getItem("walletAddress")}
                    className={`mt-2 w-full px-4 py-2 rounded-full font-semibold transition-colors ${
                      localStorage.getItem("walletAddress")
                        ? "bg-emerald-500 hover:bg-emerald-600 text-black"
                        : "bg-neutral-700 cursor-not-allowed text-neutral-400"
                    }`}
                  >
                    {localStorage.getItem("walletAddress") ? "Buy" : "Connect Wallet to Buy"}
                  </button>
                </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
