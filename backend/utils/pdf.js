const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

async function generateCertificate({ 
  title, creator, prompt, model, tokenId, ipfsHash, blockchain, qrPath 
}) {
  const outputDir = "./output/certificates";
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const filePath = `${outputDir}/certificate_${tokenId}.pdf`;

  const doc = new PDFDocument({
    size: "A4",
    layout: "portrait",
    margins: { top: 50, bottom: 50, left: 50, right: 50 }
  });

  doc.pipe(fs.createWriteStream(filePath));

  // Background texture
  const texture = path.join("storage", "paper-texture.jpg");
  if (fs.existsSync(texture)) {
    doc.image(texture, 0, 0, { width: doc.page.width, height: doc.page.height });
  }

  // Border
  doc
    .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
    .lineWidth(5)
    .stroke("#c5a253");

  // Logo
  const logoPath = path.join("storage", "art.png");
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, (doc.page.width / 2) - 40, 60, { width: 80 });
  }

  doc.moveDown(4);

  // Title
  doc
    .fontSize(28)
    .fillColor("#2b2b2b")
    .text("PROOF OF ART OWNERSHIP", { align: "center" });

  doc.moveDown(2);

  // Information Table
  doc.font("Helvetica").fontSize(14);

  const addField = (label, value) => {
    doc.text(`${label}: `, { continued: true, bold: true }).font("Helvetica-Bold").text(value).moveDown(0.5).font("Helvetica");
  };

  addField("Title", title);
  addField("Creator", creator);
  addField("Prompt", prompt);
  addField("AI Model", model);
  addField("Token ID", "#" + tokenId);
  addField("IPFS Hash", ipfsHash);
  addField("Blockchain", blockchain);

  // QR Code
  if (qrPath && fs.existsSync(qrPath)) {
    doc.moveDown(1.5);
    doc.text("Scan to Verify:", { align: "center" });
    doc.image(qrPath, (doc.page.width / 2) - 75, doc.y, { width: 150 });
  }

  // Signature
  doc.moveDown(4);
  doc.text("Authorized Signature", { align: "right" });
  doc.moveDown(1);
  doc.text("__________________________", { align: "right" });

  // Watermark
  doc
    .fontSize(60)
    .fillColor("#c5a25355")
    .opacity(0.2)
    .rotate(-30, { origin: [doc.page.width / 2, doc.page.height / 2] })
    .text("PROOF OF ART", doc.page.width / 2 - 200, doc.page.height / 2)
    .rotate(30)
    .opacity(1);

  doc.end();
  return filePath;
}

module.exports = { generateCertificate };
