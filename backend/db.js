// backend/db.js
const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "database.db");
const db = new Database(dbPath);

// Full final schema
db.exec(`
  CREATE TABLE IF NOT EXISTS artworks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phash TEXT,
    wallet TEXT,
    tokenURI TEXT,
    tokenId INTEGER,
    imageCID TEXT,
    promptHash TEXT,
    model TEXT,
    timestamp TEXT,
    createdAt TEXT
  );
`);

// Ensure missing columns exist, but silently ignore if they already do
try { db.prepare("ALTER TABLE artworks ADD COLUMN promptHash TEXT;").run(); } catch {}
try { db.prepare("ALTER TABLE artworks ADD COLUMN model TEXT;").run(); } catch {}
try { db.prepare("ALTER TABLE artworks ADD COLUMN timestamp TEXT;").run(); } catch {}
try { db.prepare("ALTER TABLE artworks ADD COLUMN createdAt TEXT;").run(); } catch {}
try { db.prepare("ALTER TABLE artworks ADD COLUMN imageCID TEXT;").run(); } catch {}

module.exports = db;
