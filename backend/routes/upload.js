const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");
const db = require("../db");
const { computePHash } = require("../utils/phash");
const { uploadImageToIPFS, uploadJSONToIPFS } = require("../utils/ipfs");
const { mintNFT } = require("../mint");
const { generateQR } = require("../utils/qr");
const { generateCertificate } = require("../utils/pdf");

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const title  = req.body.title  || "Untitled Artwork";
    const prompt = req.body.prompt || "";
    const model  = req.body.model  || "Unknown Model";
    const wallet = req.body.wallet || process.env.OWNER_WALLET;

    // 1) Compute pHash + duplicate check
    const phash = await computePHash(req.file.path);
    const existing = db.prepare("SELECT * FROM artworks WHERE phash = ?").get(phash);

    if (existing) {
      return res.json({
        status: "DUPLICATE",
        message: "Artwork already registered",
        owner: existing.wallet,
        tokenId: existing.tokenId,
        tokenURI: existing.tokenURI,
      });
    }

    // 2) Upload image → ensure CID clean
    let imageCID = await uploadImageToIPFS(req.file.path);
    imageCID = imageCID.replace(/^ipfs:\/\//, "").replace(/^ipfs\//, "");
    const imageURI = `ipfs://${imageCID}`;

    // 3) Create metadata + upload to IPFS
    const metadata = {
      name: title,
      description: prompt,
      image: imageURI,
      attributes: [
        { trait_type: "pHash", value: phash },
        { trait_type: "AI Model", value: model },
        { trait_type: "Creator Wallet", value: wallet },
        { trait_type: "Timestamp", value: new Date().toISOString() },
      ]
    };

    let metadataCID = await uploadJSONToIPFS(metadata);
    metadataCID = metadataCID.replace(/^ipfs:\/\//, "").replace(/^ipfs\//, "");
    const metadataURI = `ipfs://${metadataCID}`;

    // 4) Mint NFT
    const { txHash, tokenId } = await mintNFT(metadataURI);

    // 5) Store record in DB
      const createdAt = new Date().toISOString();


         db.prepare(
          "INSERT INTO artworks (phash, wallet, tokenURI, tokenId, imageCID, createdAt) VALUES (?,?,?,?,?,?)"
          ).run(phash, wallet, metadataURI, tokenId, imageCID, new Date().toISOString());


    // Public metadata gateway link
    const gatewayMetadataURL = `https://ipfs.io/ipfs/${metadataCID}`;

    // 6) QR Code → points to metadata page
    const qrPath = await generateQR(gatewayMetadataURL, tokenId);

    // 7) Certificate generation
    const pdfPath = await generateCertificate({
      title,
      creator: wallet,
      prompt,
      model,
      tokenId,
      ipfsHash: metadataCID,
      blockchain: "Local Hardhat (Ethereum)",
      qrPath
    });

    return res.json({
      status: "MINTED",
      tokenId,
      txHash,
      imageURI,
      metadataURI,
      gatewayMetadataURL,
      qrPath,
      certificate: pdfPath
    });

  } catch (err) {
    console.error("❌ /upload error", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
