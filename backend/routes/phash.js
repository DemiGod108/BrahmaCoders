const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload"); // Multer already exists
const { computePHash } = require("../utils/phash");
const db = require("../db");

router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    // Compute pHash
    const phash = await computePHash(req.file.path);

    // Search database for existing match
    const match = db.prepare("SELECT * FROM artworks WHERE phash = ?").get(phash);

    if (!match) {
      return res.json({
        status: "NEW",
        phash
      });
    }

    return res.json({
      status: "VERIFIED",
      wallet: match.wallet,
      tokenId: match.tokenId,
      metadataURL: `https://ipfs.io/ipfs/${match.tokenURI.replace("ipfs://", "")}`,
      timestamp: match.createdAt,
    });

  } catch (err) {
    console.error("phash verify error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
