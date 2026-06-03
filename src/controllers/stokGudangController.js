const db = require("../config/database");

// ======================================================
// HELPER: SYNC barang.stok DARI TOTAL stok_gudang
// ======================================================
const syncBarangStok = (barang_id, callback) => {
  const syncSql = `
    UPDATE barang
    SET stok = (
      SELECT COALESCE(SUM(stok), 0)
      FROM stok_gudang
      WHERE barang_id = ?
    )
    WHERE id = ?
  `;

  db.query(syncSql, [barang_id, barang_id], (errSync) => {
    if (errSync) {
      console.error("SYNC STOK ERROR:", errSync);
    }
    callback();
  });
};

// ======================================================
// CREATE STOK GUDANG
// ======================================================
exports.createStokGudang = (req, res) => {
  const { barang_id, gudang_id, stok } = req.body;

  // VALIDASI
  if (!barang_id || !gudang_id || stok == null) {
    return res.status(400).json({
      message: "Semua field wajib diisi",
    });
  }

  const sql = `
    INSERT INTO stok_gudang
    (barang_id, gudang_id, stok)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [barang_id, gudang_id, stok], (err) => {
    if (err) {
      return res.status(500).json(err);
    }

    // ✅ SYNC barang.stok
    syncBarangStok(barang_id, () => {
      res.json({
        message: "Stok gudang berhasil ditambahkan",
      });
    });
  });
};

// ======================================================
// READ ALL STOK GUDANG
// ======================================================
exports.getStokGudang = (req, res) => {
  const sql = `
    SELECT
      stok_gudang.*,
      barang.nama_barang,
      gudang.nama_gudang
    FROM stok_gudang
    LEFT JOIN barang
      ON stok_gudang.barang_id = barang.id
    LEFT JOIN gudang
      ON stok_gudang.gudang_id = gudang.id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(results);
  });
};

// ======================================================
// UPDATE STOK GUDANG
// ======================================================
exports.updateStokGudang = (req, res) => {
  const { id } = req.params;
  const { barang_id, gudang_id, stok } = req.body;

  const sql = `
    UPDATE stok_gudang
    SET
      barang_id = ?,
      gudang_id = ?,
      stok = ?
    WHERE id = ?
  `;

  db.query(sql, [barang_id, gudang_id, stok, id], (err) => {
    if (err) {
      return res.status(500).json(err);
    }

    // ✅ SYNC barang.stok
    syncBarangStok(barang_id, () => {
      res.json({
        message: "Stok gudang berhasil diupdate",
      });
    });
  });
};

// ======================================================
// DELETE STOK GUDANG
// ======================================================
exports.deleteStokGudang = (req, res) => {
  const { id } = req.params;

  // AMBIL barang_id DULU SEBELUM DELETE
  const getBarangId = `
    SELECT barang_id
    FROM stok_gudang
    WHERE id = ?
  `;

  db.query(getBarangId, [id], (err, rows) => {
    if (err) {
      return res.status(500).json(err);
    }

    if (!rows.length) {
      return res.status(404).json({
        message: "Stok gudang tidak ditemukan",
      });
    }

    const barang_id = rows[0].barang_id;

    // HAPUS STOK GUDANG
    const deleteSql = `
      DELETE FROM stok_gudang
      WHERE id = ?
    `;

    db.query(deleteSql, [id], (err2) => {
      if (err2) {
        return res.status(500).json(err2);
      }

      // ✅ SYNC barang.stok (setelah hapus, stok recalculate dari sisa gudang)
      syncBarangStok(barang_id, () => {
        res.json({
          message: "Stok gudang berhasil dihapus",
        });
      });
    });
  });
};
