"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

// ---------- helpers ----------
const GATEWAYS = [
  "https://nftstorage.link/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
];

// extract a bare CID from many possible shapes: ipfs://CID, https://.../ipfs/CID, or plain CID
function extractCID(input) {
  if (!input) return "";
  let s = String(input).trim();
  s = s.replace(/^ipfs:\/\//, "");                 // ipfs://CID -> CID
  s = s.replace(/^https?:\/\/[^/]+\/ipfs\//, "");  // https://gw/ipfs/CID -> CID
  // strip query/hash if present
  s = s.split("?")[0].split("#")[0];
  return s;
}

function resolveIPFS(input, fallbackText) {
  // returns a safe http URL for metadata links
  if (!input) return "";
  const cidOrPath = extractCID(input);
  return `${GATEWAYS[0]}${cidOrPath}` || fallbackText || "";
}

// ---------- component ----------
export default function TradePage() {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const ctrl = new AbortController();

    fetch("http://localhost:4000/list", { signal: ctrl.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setNfts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setErr(`Failed to fetch /list: ${e.message}`);
          setLoading(false);
        }
      });

    return () => ctrl.abort();
  }, []);

  if (loading) return <div className="text-center p-6 text-white">Loading artworks...</div>;

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      <Navbar />

      <div className="max-w-6xl mx-auto mt-10 p-6 space-y-6">
        <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-400">
          Certified AI Artworks
        </h2>

        {err && (
          <div className="p-3 rounded-md bg-red-900/30 border border-red-700 text-red-200 text-sm">
            {err}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
          {nfts.map((nft) => {
            // ------- normalize fields coming from backend -------
            const imageCID =
              extractCID(nft.imageCID) ||
              extractCID(nft.image) ||
              extractCID(nft.cid); // support legacy

            const metaURLRaw = nft.metadataURL || nft.metadataURI || nft.tokenURI;
            const metaHTTP = resolveIPFS(metaURLRaw) || "#";

            // ------- render -------
            return (
              <div
                key={nft.id ?? `${imageCID}-${nft.tokenId ?? Math.random()}`}
                className="bg-neutral-800/60 border border-neutral-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
              >
                {/* resilient IPFS image with multi-gateway fallback */}
                <img
                  src={`${GATEWAYS[0]}${imageCID}`}
                  onError={(e) => {
                    // try the next gateway on error
                    const current = e.currentTarget.getAttribute("data-gw-idx") || "0";
                    const idx = parseInt(current, 10);
                    const next = idx + 1;
                    if (next < GATEWAYS.length) {
                      e.currentTarget.src = `${GATEWAYS[next]}${imageCID}`;
                      e.currentTarget.setAttribute("data-gw-idx", String(next));
                    } else {
                      // final fallback: tiny transparent pixel to avoid broken icon
                      e.currentTarget.src =
                        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
                    }
                  }}
                  data-gw-idx="0"
                  alt="art"
                  className="w-full h-64 object-cover bg-neutral-900"
                  loading="lazy"
                />

                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-emerald-400">
                    Token #{nft.tokenId ?? "—"}
                  </h3>

                  <p className="text-xs text-neutral-400">
                    Creator: {nft.wallet ?? "—"}
                  </p>

                  <p className="text-xs text-neutral-500">
                    Timestamp:{" "}
                    {nft.createdAt
                      ? new Date(nft.createdAt).toLocaleString("en-IN", {
                          timeZone: "Asia/Kolkata",
                        })
                      : "N/A"}
                  </p>

                  <p className="font-semibold text-emerald-300">
                    {nft.price ?? "0 ETH"}
                  </p>

                  <a
                    href={metaHTTP}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 text-xs underline break-all"
                    title={metaHTTP}
                  >
                    View Metadata
                  </a>

                  <button
                    disabled={!globalThis?.localStorage?.getItem("walletAddress")}
                    className={`mt-2 w-full px-4 py-2 rounded-full font-semibold transition-colors ${
                      globalThis?.localStorage?.getItem("walletAddress")
                        ? "bg-emerald-500 hover:bg-emerald-600 text-black"
                        : "bg-neutral-700 cursor-not-allowed text-neutral-400"
                    }`}
                  >
                    {globalThis?.localStorage?.getItem("walletAddress")
                      ? "Buy"
                      : "Connect Wallet to Buy"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
