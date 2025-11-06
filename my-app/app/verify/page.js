"use client";
import React, { useState, useRef } from "react";
import Navbar from "../components/Navbar";

export default function VerifyPage() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  async function handleFile(file) {
    if (!file) return;

    setImage(URL.createObjectURL(file));
    setResult("LOADING");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:4000/phash", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    setResult(data);
  }

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      <Navbar />
      <div className="max-w-5xl mx-auto mt-10 p-6 space-y-10">

        <h2 className="text-3xl md:text-4xl font-extrabold text-emerald-400">
          Verify Artwork Authenticity
        </h2>

        <div
          className={`border-2 ${dragging ? "border-emerald-400" : "border-neutral-700"} border-dashed rounded-2xl p-8 text-center`}
          onDragOver={(e)=>{e.preventDefault(); setDragging(true);}}
          onDragLeave={()=>setDragging(false)}
          onDrop={handleDrop}
          onClick={()=>fileInputRef.current.click()}
        >
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e)=>handleFile(e.target.files[0])} />
          <p className="text-neutral-400">Click or drag an image to verify</p>
        </div>

        {image && (
          <img src={image} className="max-w-sm rounded-xl border border-neutral-700" />
        )}

        {result === "LOADING" && (
          <p className="text-emerald-400 text-lg animate-pulse">Verifying...</p>
        )}

        {result?.status === "VERIFIED" && (
          <div className="bg-neutral-800 border border-emerald-500 rounded-xl p-4">
            <h3 className="text-emerald-400 font-semibold mb-2">✅ Authentic Artwork</h3>
            <p>Creator Wallet: {result.wallet}</p>
            <p>Token ID: {result.tokenId}</p>
            <p>Minted On: {new Date(result.timestamp).toLocaleString()}</p>
            <a className="text-emerald-300 underline" href={result.metadataURL} target="_blank">
              View Metadata on IPFS
            </a>
          </div>
        )}

        {result?.status === "NEW" && (
          <div className="bg-neutral-800 border border-yellow-500 rounded-xl p-4">
            <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Not Registered</h3>
            <p>This image is not yet registered in the Proof-of-Art network.</p>
            <p>You may mint it to claim ownership.</p>
          </div>
        )}

      </div>
    </div>
  );
}
