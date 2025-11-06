const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM artworks ORDER BY id DESC").all();

  const formatted = rows.map(r => ({
    id: r.id,
    tokenId: r.tokenId,
    wallet: r.wallet,
    phash: r.phash,
    metadataURL: `https://ipfs.io/ipfs/${r.tokenURI.replace("ipfs://","")}`,
    image: r.imageCID ? `https://ipfs.io/ipfs/${r.imageCID}` : null,
    createdAt: r.createdAt || null,
    price: r.price || "0 ETH",
  }));

  res.json(formatted);
});

module.exports = router;
