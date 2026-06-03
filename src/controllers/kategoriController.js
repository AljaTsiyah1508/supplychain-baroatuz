require("dotenv").config();
const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

// ======================================
// GET ALL KATEGORI
// ======================================
exports.getKategori = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM kategori
      ORDER BY nama_kategori ASC
    `);

    res.json(rows);
  } catch (err) {
    console.error("GET KATEGORI ERROR:", err);
    res.status(500).json({
      message: "Gagal mengambil kategori",
      error: err.message,
    });
  }
};

// ======================================
// CREATE KATEGORI
// ======================================
exports.createKategori = async (req, res) => {
  const { nama_kategori } = req.body;

  if (!nama_kategori) {
    return res.status(400).json({
      message: "Nama kategori wajib diisi",
    });
  }

  try {
    // cek duplikat
    const [existing] = await pool.query(
      `SELECT id FROM kategori WHERE nama_kategori = ? LIMIT 1`,
      [nama_kategori],
    );

    if (existing.length > 0) {
      return res.status(409).json({
        message: "Kategori sudah ada",
        id: existing[0].id,
      });
    }

    // insert
    const [result] = await pool.query(
      `INSERT INTO kategori (nama_kategori) VALUES (?)`,
      [nama_kategori],
    );

    res.status(201).json({
      id: result.insertId,
      nama_kategori,
      message: "Kategori berhasil ditambahkan",
    });
  } catch (err) {
    console.error("CREATE KATEGORI ERROR:", err);
    res.status(500).json({
      message: "Gagal tambah kategori",
      error: err.message,
    });
  }
};

// ======================================
// UPDATE KATEGORI
// ======================================
exports.updateKategori = async (req, res) => {
  const { id } = req.params;
  const { nama_kategori } = req.body;

  if (!nama_kategori) {
    return res.status(400).json({
      message: "Nama kategori wajib diisi",
    });
  }

  try {
    const [result] = await pool.query(
      `UPDATE kategori SET nama_kategori = ? WHERE id = ?`,
      [nama_kategori, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Kategori tidak ditemukan",
      });
    }

    res.json({
      message: "Kategori berhasil diupdate",
    });
  } catch (err) {
    console.error("UPDATE KATEGORI ERROR:", err);
    res.status(500).json({
      message: "Gagal update kategori",
      error: err.message,
    });
  }
};

// ======================================
// DELETE KATEGORI
// ======================================
exports.deleteKategori = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(`DELETE FROM kategori WHERE id = ?`, [
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Kategori tidak ditemukan",
      });
    }

    res.json({
      message: "Kategori berhasil dihapus",
    });
  } catch (err) {
    console.error("DELETE KATEGORI ERROR:", err);
    res.status(500).json({
      message: "Gagal hapus kategori",
      error: err.message,
    });
  }
};
