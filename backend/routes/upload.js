const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const db = require("../db");
const { computePHash } = require("../utils/phash");
const { uploadFileToIPFS, uploadJSONToIPFS } = require("../utils/ipfs");
const { mintNFT } = require("../mint");
const { generateQR } = require("../utils/qr");
const { generateCertificate } = require("../utils/pdf");
const crypto = require("crypto");
const fs = require("fs");

// ✅ Convert timestamps to proper ISO always
function normalizeTimestamp(ts) {
  if (!ts) return new Date().toISOString();
  if (!isNaN(Number(ts))) return new Date(Number(ts)).toISOString();
  const d = new Date(ts);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const title  = req.body.title  || "Untitled AI Creation";
    const prompt = req.body.prompt || "";
    const model  = req.body.model  || "Unknown Model";
    const wallet = req.body.wallet || process.env.OWNER_WALLET;

    // ✅ Always ISO formatted
    const timestampISO = normalizeTimestamp(req.body.timestamp);

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    const isImage = mimeType.startsWith("image/");

    let fileHash;

    try {
      if (isImage) {
        fileHash = await computePHash(filePath); // pHash for images
      } else {
        throw new Error("Not image");
      }
    } catch {
      const buffer = fs.readFileSync(filePath); // SHA256 fallback
      fileHash = crypto.createHash("sha256").update(buffer).digest("hex");
    }

    // ✅ Duplicate check
    const existing = db.prepare("SELECT * FROM artworks WHERE phash = ?").get(fileHash);
    if (existing) {
      return res.json({
        status: "DUPLICATE",
        message: "Already registered on-chain",
        owner: existing.wallet,
        tokenId: existing.tokenId,
        metadataURI: existing.tokenURI
      });
    }

    // ✅ Upload media (any type)
    let mediaCID = await uploadFileToIPFS(filePath);
    mediaCID = mediaCID.replace("ipfs://", "");
    const mediaURI = `ipfs://${mediaCID}`;

    const promptHash = crypto.createHash("sha256").update(prompt).digest("hex");

    // ✅ Metadata
    const metadata = {
      name: title,
      description: prompt,
      file: mediaURI,
      media_type: mimeType,
      attributes: [
        { trait_type: "File Hash", value: fileHash },
        { trait_type: "Prompt Hash", value: promptHash },
        { trait_type: "AI Model", value: model },
        { trait_type: "Creator Wallet", value: wallet },
        { trait_type: "Timestamp", value: timestampISO }
      ]
    };

    let metadataCID = await uploadJSONToIPFS(metadata);
    metadataCID = metadataCID.replace("ipfs://", "");
    const metadataURI = `ipfs://${metadataCID}`;

    // ✅ Mint NFT properly
    const { txHash, tokenId } = await mintNFT(metadataURI);

    // ✅ Store in DB with correct timestamp
    db.prepare(
      "INSERT INTO artworks (phash, wallet, tokenURI, tokenId, imageCID, promptHash, model, timestamp, createdAt) VALUES (?,?,?,?,?,?,?,?,?)"
    ).run(
      fileHash,
      wallet,
      metadataURI,
      tokenId,
      mediaCID,
      promptHash,
      model,
      timestampISO,
      timestampISO
    );

    // ✅ Generate certificate + QR
    const verifyURL = `https://ipfs.io/ipfs/${metadataCID}`;
    const qrPath = await generateQR(verifyURL, tokenId);
    const pdfPath = await generateCertificate({
      title, creator: wallet, prompt, model, tokenId,
      ipfsHash: metadataCID, blockchain: "Local Hardhat", qrPath
    });

    return res.json({
      status: "MINTED",
      tokenId,
      txHash,
      wallet,
      model,
      timestamp: timestampISO,
      fileHash,
      promptHash,
      mediaCID,
      metadataURI,
      verifyURL,
      qrPath,
      certificate: pdfPath
    });

  } catch (err) {
    console.error("❌ /upload error", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
