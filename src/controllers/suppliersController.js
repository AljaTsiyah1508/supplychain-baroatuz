const db = require("../config/database");

// ─────────────────────────────────────────────
// CREATE SUPPLIER
// ─────────────────────────────────────────────
exports.createSupplier = (req, res) => {
  const { nama_supplier, alamat, telepon } = req.body;

  // VALIDASI
  if (!nama_supplier) {
    return res.status(400).json({
      message: "Nama supplier wajib diisi",
    });
  }

  const sql = `
    INSERT INTO suppliers
    (
      nama_supplier,
      alamat,
      telepon
    )
    VALUES (?, ?, ?)
  `;

  db.query(
    sql,
    [nama_supplier, alamat || null, telepon || null],
    (err, result) => {
      if (err) {
        console.log("CREATE SUPPLIER ERROR:", err);

        return res.status(500).json({
          message: "Gagal menambah supplier",
          error: err,
        });
      }

      // FIX IMPORTANT
      res.json({
        message: "Supplier berhasil ditambahkan",

        id: result.insertId,

        data: {
          id: result.insertId,
          nama_supplier,

          alamat: alamat || null,

          telepon: telepon || null,
        },
      });
    },
  );
};

// ─────────────────────────────────────────────
// READ ALL SUPPLIER
// ─────────────────────────────────────────────
exports.getSupplier = (req, res) => {
  const sql = `
    SELECT *
    FROM suppliers
    ORDER BY id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.log("GET SUPPLIER ERROR:", err);

      return res.status(500).json({
        message: "Gagal mengambil supplier",
        error: err,
      });
    }

    res.json(results);
  });
};

// ─────────────────────────────────────────────
// UPDATE SUPPLIER
// ─────────────────────────────────────────────
exports.updateSupplier = (req, res) => {
  const { id } = req.params;

  const { nama_supplier, alamat, telepon } = req.body;

  // VALIDASI
  if (!nama_supplier) {
    return res.status(400).json({
      message: "Nama supplier wajib diisi",
    });
  }

  const sql = `
    UPDATE suppliers
    SET
      nama_supplier = ?,
      alamat = ?,
      telepon = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [nama_supplier, alamat || null, telepon || null, id],
    (err, result) => {
      if (err) {
        console.log("UPDATE SUPPLIER ERROR:", err);

        return res.status(500).json({
          message: "Gagal update supplier",
          error: err,
        });
      }

      res.json({
        message: "Supplier berhasil diupdate",
      });
    },
  );
};

// ─────────────────────────────────────────────
// DELETE SUPPLIER
// ─────────────────────────────────────────────
exports.deleteSupplier = (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM suppliers
    WHERE id = ?
  `;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.log("DELETE SUPPLIER ERROR:", err);

      return res.status(500).json({
        message: "Gagal menghapus supplier",
        error: err,
      });
    }

    res.json({
      message: "Supplier berhasil dihapus",
    });
  });
};
