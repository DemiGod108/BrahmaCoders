const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const phash = req.query.phash;
  if (!phash) return res.status(400).json({ error: "Missing phash" });

  const row = db.prepare("SELECT * FROM artworks WHERE phash = ?").get(phash);

  if (!row) {
    return res.json({ status: "NOT_FOUND" });
  }

  return res.json({
    status: "VERIFIED",
    wallet: row.wallet,
    tokenId: row.tokenId,
    metadataURL: `https://ipfs.io/ipfs/${row.tokenURI.replace("ipfs://","")}`,
    timestamp: row.createdAt,
  });
});

module.exports = router;
