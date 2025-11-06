const fs = require("fs");
const path = require("path");

function buildVerifierPage({ title, wallet, prompt, model, tokenId, ipfs }) {
  const html = `<!DOCTYPE html>
<html>
<head>
<title>${title} • Proof of Art</title>
<style>
body { font-family: Arial, sans-serif; background:#0d1117; color:#fff; padding:30px; }
.card { max-width:600px; margin:auto; border:1px solid #30363d; padding:20px; border-radius:12px; background:#161b22; }
h1 { text-align:center; }
table { width:100%; margin-top:20px; border-collapse:collapse; }
td { padding:8px; border-bottom:1px solid #30363d; }
</style>
</head>
<body>
<div class="card">
<h1>Proof of Art</h1>
<table>
<tr><td><b>Title</b></td><td>${title}</td></tr>
<tr><td><b>Creator Wallet</b></td><td>${wallet}</td></tr>
<tr><td><b>Prompt</b></td><td>${prompt}</td></tr>
<tr><td><b>AI Model</b></td><td>${model}</td></tr>
<tr><td><b>Token ID</b></td><td>#${tokenId}</td></tr>
<tr><td><b>IPFS Metadata</b></td><td><a href="${ipfs.replace("ipfs://","https://ipfs.io/ipfs/")}" target="_blank">View on IPFS</a></td></tr>
</table>
</div>
</body>
</html>`;

  const outDir = "dist";
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const filePath = path.join(outDir, `POA-${tokenId}.html`);
  fs.writeFileSync(filePath, html);
  return filePath;
}

module.exports = { buildVerifierPage };
