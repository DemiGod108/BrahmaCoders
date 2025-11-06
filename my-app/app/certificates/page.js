"use client";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function CertificatesPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/certificates")
      .then(res => res.json())
      .then(setItems)
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      <Navbar />

      <div className="max-w-5xl mx-auto mt-10 p-6 space-y-6">
        <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-400">Certificates</h2>
        <p className="text-neutral-400">Download NFT ownership certificates and verification QR codes.</p>

        <div className="space-y-4 mt-6">
          {items.map(item => (
            <div key={item.tokenId} className="bg-neutral-800/60 border border-neutral-700 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="text-emerald-300 font-semibold">Token #{item.tokenId}</p>
                <p className="text-neutral-400 text-sm">Owner: {item.wallet}</p>
                <p className="text-neutral-500 text-xs">Issued: {new Date(item.createdAt).toLocaleString()}</p>
              </div>

              <div className="flex gap-3">
                <a href={`http://localhost:4000${item.certificatePath}`} download
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-lg font-semibold">
                  Download PDF
                </a>
                <a href={`http://localhost:4000${item.qrPath}`} download
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-black rounded-lg font-semibold">
                  Download QR
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
