const db = require("../config/database");

// ─────────────────────────────────────────────
// CREATE BARANG
// ─────────────────────────────────────────────
exports.createBarang = (req, res) => {
  const { nama_barang, kategori_id, supplier_id, harga, stok, gudang_id } =
    req.body;

  const sql = `
    INSERT INTO barang
    (nama_barang, kategori_id, supplier_id, harga, stok)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      nama_barang,
      kategori_id || null,
      supplier_id || null,
      harga || 0,
      stok || 0,
    ],
    (err, result) => {
      if (err) {
        console.error("ERROR CREATE BARANG:", err);
        return res.status(500).json({ message: "Gagal menambahkan barang" });
      }

      const newBarangId = result.insertId;

      // ──────────────────────────────────────────────
      // KALAU TIDAK ADA GUDANG / STOK → SKIP SYNC
      // ──────────────────────────────────────────────
      if (!gudang_id || !stok || stok <= 0) {
        return res.json({
          message: "Barang berhasil ditambahkan",
          id: newBarangId,
        });
      }

      // ──────────────────────────────────────────────
      // UPDATE STOK GUDANG KALAU SUDAH ADA
      // ──────────────────────────────────────────────
      const updateStok = `
        UPDATE stok_gudang
        SET stok = stok + ?
        WHERE barang_id = ? AND gudang_id = ?
      `;

      // ──────────────────────────────────────────
      // HELPER: SYNC barang.stok DARI stok_gudang
      // ──────────────────────────────────────────
      const syncBarangStok = (callback) => {
        const syncSql = `
          UPDATE barang
          SET stok = (
            SELECT COALESCE(SUM(stok), 0)
            FROM stok_gudang
            WHERE barang_id = ?
          )
          WHERE id = ?
        `;
        db.query(syncSql, [newBarangId, newBarangId], callback);
      };

      db.query(updateStok, [stok, newBarangId, gudang_id], (err2, result2) => {
        if (err2) {
          console.error("ERROR UPDATE STOK GUDANG:", err2);
          return res.status(500).json({
            message: "Barang tersimpan tapi gagal sync stok gudang",
          });
        }

        // ──────────────────────────────────────────
        // KALAU SUDAH ADA → SYNC barang.stok LALU RETURN
        // ──────────────────────────────────────────
        if (result2.affectedRows > 0) {
          return syncBarangStok((err3) => {
            if (err3) console.error("ERROR SYNC BARANG:", err3);
            return res.json({
              message: "Barang berhasil ditambahkan",
              id: newBarangId,
            });
          });
        }

        // ──────────────────────────────────────────
        // BELUM ADA → INSERT BARU KE STOK GUDANG
        // ──────────────────────────────────────────
        const insertStok = `
            INSERT INTO stok_gudang (barang_id, gudang_id, stok)
            VALUES (?, ?, ?)
          `;

        db.query(insertStok, [newBarangId, gudang_id, stok], (err3) => {
          if (err3) {
            console.error("ERROR INSERT STOK GUDANG:", err3);
            return res.status(500).json({
              message: "Barang tersimpan tapi gagal insert stok gudang",
            });
          }

          // ✅ SYNC barang.stok
          syncBarangStok((err4) => {
            if (err4) console.error("ERROR SYNC BARANG:", err4);
            return res.json({
              message: "Barang berhasil ditambahkan",
              id: newBarangId,
            });
          });
        });
      });
    },
  );
};

// ─────────────────────────────────────────────
// GET ALL BARANG
// ─────────────────────────────────────────────
exports.getBarang = (req, res) => {
  const sql = `
    SELECT 
      barang.*,
      kategori.nama_kategori,
      COALESCE(s_masuk.nama_supplier, s_barang.nama_supplier) AS nama_supplier
    FROM barang
    LEFT JOIN kategori 
      ON barang.kategori_id = kategori.id
    LEFT JOIN (
      SELECT barang_id, supplier_id
      FROM barang_masuk
      WHERE id IN (
        SELECT MAX(id) FROM barang_masuk GROUP BY barang_id
      )
    ) bm_last ON bm_last.barang_id = barang.id
    LEFT JOIN suppliers s_masuk
      ON bm_last.supplier_id = s_masuk.id
    LEFT JOIN suppliers s_barang
      ON barang.supplier_id = s_barang.id
    ORDER BY barang.id DESC
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("ERROR GET BARANG:", err);
      return res.status(500).json({ message: "Gagal mengambil data barang" });
    }
    res.json(rows);
  });
};

// ─────────────────────────────────────────────
// UPDATE BARANG
// ─────────────────────────────────────────────
exports.updateBarang = (req, res) => {
  const { id } = req.params;
  const { nama_barang, kategori_id, supplier_id, harga, stok } = req.body;

  const sql = `
    UPDATE barang
    SET
      nama_barang = ?,
      kategori_id = ?,
      supplier_id = ?,
      harga = ?,
      stok = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      nama_barang,
      kategori_id || null,
      supplier_id || null,
      harga || 0,
      stok || 0,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("ERROR UPDATE BARANG:", err);
        return res.status(500).json({ message: "Gagal update barang" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Barang tidak ditemukan" });
      }
      res.json({ message: "Barang berhasil diupdate" });
    },
  );
};

// ─────────────────────────────────────────────
// DELETE BARANG (cascade manual via transaction)
// ─────────────────────────────────────────────
exports.deleteBarang = (req, res) => {
  const { id } = req.params;

  db.getConnection((errConn, connection) => {
    if (errConn) {
      console.error("ERROR GET CONNECTION:", errConn);
      return res.status(500).json({ message: "Gagal koneksi ke database" });
    }

    connection.beginTransaction((errTx) => {
      if (errTx) {
        connection.release();
        console.error("ERROR BEGIN TRANSACTION:", errTx);
        return res.status(500).json({ message: "Gagal memulai transaksi" });
      }

      const deleteSteps = [
        "DELETE FROM stok_gudang    WHERE barang_id = ?",
        "DELETE FROM barang_masuk   WHERE barang_id = ?",
        "DELETE FROM barang_keluar  WHERE barang_id = ?",
        "DELETE FROM mutasi_gudang  WHERE barang_id = ?",
        "DELETE FROM purchase_order WHERE barang_id = ?",
        "DELETE FROM barang         WHERE id = ?",
      ];

      const runNext = (index) => {
        if (index >= deleteSteps.length) {
          connection.commit((errCommit) => {
            connection.release();
            if (errCommit) {
              console.error("ERROR COMMIT:", errCommit);
              return res
                .status(500)
                .json({ message: "Gagal menyimpan perubahan" });
            }
            return res.json({
              message: "Barang dan semua data terkait berhasil dihapus",
            });
          });
          return;
        }

        connection.query(deleteSteps[index], [id], (errQuery) => {
          if (errQuery) {
            connection.rollback(() => {
              connection.release();
              console.error(`ERROR STEP ${index}:`, errQuery);
              return res
                .status(500)
                .json({ message: "Gagal menghapus barang" });
            });
            return;
          }
          runNext(index + 1);
        });
      };

      runNext(0);
    });
  });
};
