"use client";
import React, { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import EXIF from "exif-js";

export default function VerifyPage() {
  const [image, setImage] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [fakeChainData, setFakeChainData] = useState(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);

    EXIF.getData(file, function () {
      const allMeta = EXIF.getAllTags(this);
      setMetadata(allMeta);
    });

    // mimic blockchain data fetch (simulate delay)
    setTimeout(() => {
      setFakeChainData({
        promptHash: "0xabc123fakehash",
        imageHash: "QmFakePinataCID123456",
        timestamp: new Date().toISOString(),
        faceHash: "0xfacedeadbeef0011",
        modelUsed: "Stable Diffusion v3.5",
      });
    }, 1000);
  };

  const handleFileChange = (e) => handleFile(e.target.files[0]);
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
          Verify Your Image
        </h2>
        <p className="text-neutral-400 max-w-lg">
          Upload or drag an image to extract its metadata and simulated blockchain info.
        </p>

        {/* Upload zone */}
        <div
          className={`border-2 ${
            dragging ? "border-emerald-400 bg-neutral-800/80" : "border-neutral-700 bg-neutral-800/50"
          } border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-neutral-400">
            {dragging ? "Drop the image here..." : "Click or drag an image to upload"}
          </p>
          <p className="text-xs text-neutral-500 mt-2">Supported: JPG, PNG, JPEG</p>
        </div>

        {image && (
          <div className="flex flex-col md:flex-row items-start gap-8 mt-8">
            {/* Image preview */}
            <div className="flex-1">
              <img
                src={image}
                alt="Uploaded"
                className="rounded-2xl shadow-xl border border-neutral-700 w-full max-w-md mx-auto"
              />
            </div>

            {/* Data panels */}
            <div className="flex-1 flex flex-col gap-6">
              {/* EXIF Metadata */}
              <div className="bg-neutral-800/60 border border-neutral-700 rounded-2xl p-4 overflow-auto max-h-[300px]">
                <h3 className="font-semibold text-emerald-400 mb-3">EXIF Metadata</h3>
                {metadata && Object.keys(metadata).length > 0 ? (
                  <pre className="text-xs text-neutral-300 whitespace-pre-wrap break-words">
                    {JSON.stringify(metadata, null, 2)}
                  </pre>
                ) : (
                  <p className="text-neutral-500 text-sm">
                    No EXIF metadata found. Try uploading a raw photo with EXIF data.
                  </p>
                )}
              </div>

              {/* Simulated On-chain Metadata */}
              {fakeChainData && (
                <div className="bg-neutral-800/60 border border-emerald-600 rounded-2xl p-4">
                  <h3 className="font-semibold text-emerald-400 mb-3">
                    Simulated Blockchain Metadata
                  </h3>
                  <ul className="text-sm text-neutral-300 space-y-1">
                    <li><span className="text-emerald-400">Prompt Hash:</span> {fakeChainData.promptHash}</li>
                    <li><span className="text-emerald-400">Image Hash:</span> {fakeChainData.imageHash}</li>
                    <li><span className="text-emerald-400">Timestamp:</span> {fakeChainData.timestamp}</li>
                    <li><span className="text-emerald-400">Face Hash:</span> {fakeChainData.faceHash}</li>
                    <li><span className="text-emerald-400">Model Used:</span> {fakeChainData.modelUsed}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
