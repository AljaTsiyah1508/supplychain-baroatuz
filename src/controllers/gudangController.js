const db = require("../config/database");

// ─────────────────────────────────────────────
// CREATE GUDANG
// ─────────────────────────────────────────────
exports.createGudang = (req, res) => {
  const { nama_gudang, lokasi, kapasitas } = req.body;

  // VALIDASI
  if (!nama_gudang || !lokasi) {
    return res.status(400).json({
      message: "Semua field wajib diisi",
    });
  }

  const sql = `
    INSERT INTO gudang
    (
      nama_gudang,
      lokasi,
      kapasitas
    )
    VALUES (?, ?, ?)
  `;

  db.query(
    sql,
    [nama_gudang, lokasi, Number(kapasitas) || 0],
    (err, result) => {
      if (err) {
        console.error("CREATE GUDANG ERROR:", err);
        return res.status(500).json({
          message: "Gagal menambah gudang",
        });
      }

      res.json({
        message: "Gudang berhasil ditambahkan",
        id: result.insertId,
        data: {
          id: result.insertId,
          nama_gudang,
          lokasi,
          kapasitas: Number(kapasitas) || 0,
        },
      });
    },
  );
};

// ─────────────────────────────────────────────
// READ ALL GUDANG
// ─────────────────────────────────────────────
exports.getGudang = (req, res) => {
  const sql = `
    SELECT *
    FROM gudang
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("GET GUDANG ERROR:", err);
      return res.status(500).json({
        message: "Gagal mengambil data gudang",
      });
    }

    res.json(results);
  });
};

// ─────────────────────────────────────────────
// UPDATE GUDANG
// ─────────────────────────────────────────────
exports.updateGudang = (req, res) => {
  const { id } = req.params;
  const { nama_gudang, lokasi, kapasitas } = req.body;

  // VALIDASI
  if (!nama_gudang || !lokasi) {
    return res.status(400).json({
      message: "Semua field wajib diisi",
    });
  }

  const sql = `
    UPDATE gudang
    SET
      nama_gudang = ?,
      lokasi = ?,
      kapasitas = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [nama_gudang, lokasi, Number(kapasitas) || 0, id],
    (err, result) => {
      if (err) {
        console.error("UPDATE GUDANG ERROR:", err);
        return res.status(500).json({
          message: "Gagal update gudang",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Gudang tidak ditemukan" });
      }

      res.json({
        message: "Gudang berhasil diupdate",
      });
    },
  );
};

// ─────────────────────────────────────────────
// DELETE GUDANG (DENGAN ERROR HANDLING FK)
// ─────────────────────────────────────────────
exports.deleteGudang = (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM gudang
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      // Handle foreign key constraint error
      if (err.code === "ER_ROW_IS_REFERENCED_2") {
        return res.status(400).json({
          message:
            "Gudang masih digunakan dalam transaksi sehingga tidak dapat dihapus",
        });
      }

      console.error("ERROR DELETE GUDANG:", err);
      return res.status(500).json({
        message: "Gagal menghapus gudang",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Gudang tidak ditemukan",
      });
    }

    res.json({
      message: "Gudang berhasil dihapus",
    });
  });
};
