const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// --- UI (simple browser uploader) ---
app.get("/upload-ui", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "upload.html"));
});

// --- API routes ---
app.use("/upload", require("./routes/upload"));
app.use("/list", require("./routes/list"));
app.use("/verify", require("./routes/verify"));
app.use("/phash", require("./routes/phash"));
app.use("/certificates", require("./routes/certificates"));


// Root ping
app.get("/", (_req, res) => {
  res.send("✅ Proof-of-Art API Running");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend Live at http://localhost:${PORT}`);
});
