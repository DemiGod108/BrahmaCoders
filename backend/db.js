// backend/db.js
const Database = require("better-sqlite3");
const path = require("path");

// Create / connect to database file
const dbPath = path.join(__dirname, "database.db");
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS artworks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phash TEXT,
    wallet TEXT,
    cid TEXT,
    tokenURI TEXT,
    tokenId INTEGER,
    timestamp TEXT
  );
`);
// ✅ Ensure new columns exist (no data loss)
try { db.prepare("ALTER TABLE artworks ADD COLUMN imageCID TEXT").run(); } catch {}
try { db.prepare("ALTER TABLE artworks ADD COLUMN createdAt TEXT").run(); } catch {}

module.exports = db;
