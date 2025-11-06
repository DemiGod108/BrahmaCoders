const express = require("express");
const router = express.Router();
const db = require("../db");
const path = require("path");

router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM artworks ORDER BY id DESC").all();

  const formatted = rows.map(r => ({
    tokenId: r.tokenId,
    wallet: r.wallet,
    createdAt: r.createdAt,
    certificatePath: `/certificates/${r.tokenId}.pdf`,
    qrPath: `/qr/${r.tokenId}.png`
  }));

  res.json(formatted);
});

// Serve certificate files
router.get("/:tokenId.pdf", (req, res) => {
  const pdfFile = path.join(__dirname, "..", "output", "certificates", `certificate_${req.params.tokenId}.pdf`);
  res.sendFile(pdfFile);
});

// Serve QR files
router.get("/qr/:tokenId.png", (req, res) => {
  const qrFile = path.join(__dirname, "..", "output", "qrs", `qr_${req.params.tokenId}.png`);
  res.sendFile(qrFile);
});

module.exports = router;
