const db = require("../config/database");

// ======================================
// CREATE MUTASI GUDANG
// ======================================
exports.createMutasiGudang = (req, res) => {
  const { barang_id, gudang_asal_id, gudang_tujuan_id, qty } = req.body;

  // VALIDASI
  if (!barang_id || !gudang_asal_id || !gudang_tujuan_id || !qty) {
    return res.status(400).json({
      message: "Semua field wajib diisi",
    });
  }

  // CEK STOK GUDANG ASAL
  const sqlCekStok = `
    SELECT * FROM stok_gudang
    WHERE barang_id = ? AND gudang_id = ?
  `;

  db.query(sqlCekStok, [barang_id, gudang_asal_id], (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }

    // STOK TIDAK ADA
    if (results.length === 0) {
      return res.status(404).json({
        message: "Stok gudang asal tidak ditemukan",
      });
    }

    const stokSekarang = results[0].stok;

    // STOK TIDAK CUKUP
    if (stokSekarang < qty) {
      return res.status(400).json({
        message: "Stok gudang asal tidak mencukupi",
      });
    }

    // SIMPAN MUTASI
    const sqlMutasi = `
        INSERT INTO mutasi_gudang
        (
          barang_id,
          gudang_asal_id,
          gudang_tujuan_id,
          qty
        )
        VALUES (?, ?, ?, ?)
      `;

    db.query(
      sqlMutasi,
      [barang_id, gudang_asal_id, gudang_tujuan_id, qty],
      (err, result) => {
        if (err) {
          return res.status(500).json(err);
        }

        // KURANGI STOK GUDANG ASAL
        const sqlKurangStok = `
            UPDATE stok_gudang
            SET stok = stok - ?
            WHERE barang_id = ? AND gudang_id = ?
          `;

        db.query(
          sqlKurangStok,
          [qty, barang_id, gudang_asal_id],
          (err, result) => {
            if (err) {
              return res.status(500).json(err);
            }

            // TAMBAH STOK GUDANG TUJUAN
            const sqlTambahStok = `
                INSERT INTO stok_gudang
                (
                  barang_id,
                  gudang_id,
                  stok
                )
                VALUES (?, ?, ?)

                ON DUPLICATE KEY UPDATE
                stok = stok + VALUES(stok)
              `;

            db.query(
              sqlTambahStok,
              [barang_id, gudang_tujuan_id, qty],
              (err, result) => {
                if (err) {
                  return res.status(500).json(err);
                }

                res.json({
                  message: "Mutasi gudang berhasil",
                });
              },
            );
          },
        );
      },
    );
  });
};

// ======================================
// READ ALL MUTASI
// ======================================
exports.getMutasiGudang = (req, res) => {
  const sql = `

    SELECT

      mutasi_gudang.*,

      barang.nama_barang,

      gudang_asal.nama_gudang
        AS nama_gudang_asal,

      gudang_tujuan.nama_gudang
        AS nama_gudang_tujuan

    FROM mutasi_gudang

    LEFT JOIN barang
      ON mutasi_gudang.barang_id = barang.id

    LEFT JOIN gudang AS gudang_asal
      ON mutasi_gudang.gudang_asal_id = gudang_asal.id

    LEFT JOIN gudang AS gudang_tujuan
      ON mutasi_gudang.gudang_tujuan_id = gudang_tujuan.id

    ORDER BY mutasi_gudang.tanggal DESC

  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(results);
  });
};
