const express = require("express");
const path = require("path");
const Database = require("better-sqlite3");

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database("loan.db");

db.exec(`
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  amount REAL NOT NULL,
  term INTEGER NOT NULL,
  purpose TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
`);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/applications", (req, res) => {
  const { full_name, phone, email, amount, term, purpose } = req.body;
  if (!full_name || !phone || !amount || !term) {
    return res.status(400).json({ error: "Please fill in all required fields." });
  }
  const stmt = db.prepare(`
    INSERT INTO applications (full_name, phone, email, amount, term, purpose)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(full_name, phone, email || "", Number(amount), Number(term), purpose || "");
  res.json({ success: true, application_id: result.lastInsertRowid });
});

app.get("/api/applications", (req, res) => {
  const rows = db.prepare("SELECT * FROM applications ORDER BY id DESC").all();
  res.json(rows);
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => console.log(`Loan website running on port ${PORT}`));
