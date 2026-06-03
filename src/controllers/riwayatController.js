const db = require("../config/database");

exports.getRiwayat = (req, res) => {
  const sql = `

    SELECT
      'Barang Masuk' AS tipe,
      'Barang Masuk' AS jenis,
      bm.qty,
      bm.tanggal,
      b.nama_barang,
      g.nama_gudang,
      g.nama_gudang AS keterangan

    FROM barang_masuk bm

    LEFT JOIN barang b
      ON bm.barang_id = b.id

    LEFT JOIN gudang g
      ON bm.gudang_id = g.id


    UNION ALL


    SELECT
      'Barang Keluar' AS tipe,
      'Barang Keluar' AS jenis,
      bk.qty,
      bk.tanggal,
      b.nama_barang,
      g.nama_gudang,
      g.nama_gudang AS keterangan

    FROM barang_keluar bk

    LEFT JOIN barang b
      ON bk.barang_id = b.id

    LEFT JOIN gudang g
      ON bk.gudang_id = g.id


    UNION ALL


    SELECT
      'Mutasi Gudang' AS tipe,
      'Mutasi Gudang' AS jenis,
      mg.qty,
      mg.tanggal,
      b.nama_barang,

      CONCAT(
        g1.nama_gudang,
        ' → ',
        g2.nama_gudang
      ) AS nama_gudang,

      CONCAT(
        g1.nama_gudang,
        ' → ',
        g2.nama_gudang
      ) AS keterangan

    FROM mutasi_gudang mg

    LEFT JOIN barang b
      ON mg.barang_id = b.id

    LEFT JOIN gudang g1
      ON mg.gudang_asal_id = g1.id

    LEFT JOIN gudang g2
      ON mg.gudang_tujuan_id = g2.id


    ORDER BY tanggal DESC

  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json(err);
    }

    res.json(results);
  });
};
