// src/config/database.js

const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "supplychain_baroatuz",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test koneksi
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database Connection Failed:", err.message);
  } else {
    console.log(
      "✅ Database Connected Successfully →",
      process.env.DB_NAME || "supplychain_baroatuz"
    );
    connection.release();
  }
});

module.exports = db;