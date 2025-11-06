const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

async function generateQR(data, outputFilePath) {
  const dir = path.dirname(outputFilePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  await QRCode.toFile(outputFilePath, data, {
    color: { dark: "#000000", light: "#FFFFFF" },
    width: 512,
  });

  return outputFilePath;
}

module.exports = { generateQR };
