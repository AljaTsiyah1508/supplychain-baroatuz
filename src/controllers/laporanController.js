const db = require("../config/database");

// LAPORAN STOK KRITIS
exports.getStokKritis = (req, res) => {

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
    WHERE stok_gudang.stok < 10
  `;

  db.query(sql, (err, results) => {

    if (err) {
      return res.status(500).json(err);
    }

    // jika tidak ada stok kritis
    if (results.length === 0) {
      return res.json({
        message: "Tidak ada stok kritis",
      });
    }

    res.json(results);
  });
};

// LAPORAN STOK MINIMUM
exports.getStokMinimum = (req, res) => {

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
    WHERE stok_gudang.stok <= 5
  `;

  db.query(sql, (err, results) => {

    if (err) {
      return res.status(500).json(err);
    }

    if (results.length === 0) {
  return res.json({
    message: "Tidak ada stok minimum",
  });
}
    res.json(results);
  });
};