const sharp = require("sharp");

async function computePHash(imagePath) {
  const img = await sharp(imagePath)
    .resize(32, 32, { fit: "fill" })
    .greyscale()
    .raw()
    .toBuffer();

  const pixels = Array.from(img);
  const avg = pixels.reduce((a, b) => a + b, 0) / pixels.length;
  return pixels.map(p => (p > avg ? "1" : "0")).join("");
}

// Hamming distance
function comparePHash(hash1, hash2) {
  if (!hash1 || !hash2) return 999;
  return hash1.split("").reduce((dist, bit, idx) =>
    dist + (bit !== hash2[idx] ? 1 : 0), 0);
}

module.exports = { computePHash, comparePHash };
