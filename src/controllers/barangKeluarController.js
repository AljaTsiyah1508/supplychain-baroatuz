const db = require("../config/database");

// ======================================================
// CREATE BARANG KELUAR + SYNC STOK
// ======================================================
exports.createBarangKeluar = (req, res) => {
  const { barang_id, gudang_id, qty, tanggal } = req.body;
  console.log("BODY MASUK:", req.body);

  // VALIDASI
  if (!barang_id || !gudang_id || !qty) {
    return res.status(400).json({
      message: "Semua field wajib diisi",
    });
  }

  // CEK STOK
  db.query(
    `SELECT * FROM stok_gudang WHERE barang_id = ? AND gudang_id = ?`,
    [barang_id, gudang_id],
    (err, results) => {
      if (err) {
        console.error("ERROR CEK STOK:", err);
        return res.status(500).json({
          message: "DB error cek stok",
        });
      }

      const stokAda =
        results.length > 0 ? Number(results[0].stok ?? results[0].qty ?? 0) : 0;

      if (stokAda <= 0) {
        return res.status(400).json({
          message: "Stok tidak tersedia di gudang ini",
        });
      }

      if (stokAda < Number(qty)) {
        return res.status(400).json({
          message: `Stok tidak mencukupi. Tersedia: ${stokAda}`,
        });
      }

      // INSERT BARANG KELUAR
      db.query(
        `INSERT INTO barang_keluar (barang_id, gudang_id, qty, tanggal)
         VALUES (?, ?, ?, ?)`,
        [barang_id, gudang_id, qty, tanggal || null],
        (err, result) => {
          if (err) {
            console.error("ERROR INSERT BARANG KELUAR:", err);
            return res.status(500).json({
              message: "Gagal insert barang keluar",
            });
          }

          // UPDATE STOK GUDANG
          db.query(
            `UPDATE stok_gudang SET stok = stok - ? 
             WHERE barang_id = ? AND gudang_id = ?`,
            [qty, barang_id, gudang_id],
            (errUpdate) => {
              if (errUpdate) {
                console.error("ERROR UPDATE STOK GUDANG:", errUpdate);
                return res.status(500).json({
                  message: "Gagal update stok gudang",
                });
              }

              // SYNC ke tabel barang (PENTING!)
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
                  console.error("ERROR SYNC BARANG STOK:", errSync);
                  // Tetap lanjutkan response meski sync gagal (non-blocking)
                }

                res.status(200).json({
                  message: "Barang keluar berhasil dan stok diperbarui",
                });
              });
            },
          );
        },
      );
    },
  );
};

// ======================================================
// GET ALL BARANG KELUAR
// ======================================================
exports.getBarangKeluar = (req, res) => {
  db.query(
    `SELECT
      barang_keluar.*,
      barang.nama_barang,
      gudang.nama_gudang
     FROM barang_keluar
     LEFT JOIN barang ON barang_keluar.barang_id = barang.id
     LEFT JOIN gudang ON barang_keluar.gudang_id = gudang.id
     ORDER BY barang_keluar.id DESC`,
    (err, results) => {
      if (err) {
        console.error("ERROR GET BARANG KELUAR:", err);
        return res.status(500).json({
          message: "Gagal mengambil data barang keluar",
        });
      }
      res.status(200).json(results);
    },
  );
};
