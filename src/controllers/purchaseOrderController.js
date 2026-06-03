const db = require("../config/database");

// ======================================================
// CREATE PURCHASE ORDER
// SUPPORT BARANG BARU
// ======================================================
exports.createPurchaseOrder = (req, res) => {
  let { supplier_id, barang_id, nama_barang, gudang_id, qty } = req.body;

  // VALIDASI
  if (!supplier_id || !gudang_id || !qty) {
    return res.status(400).json({
      message: "Semua field wajib diisi",
    });
  }

  // ======================================================
  // FUNCTION INSERT PO
  // ======================================================
  const insertPO = (finalBarangId) => {
    const sql = `
      INSERT INTO purchase_order
      (
        supplier_id,
        barang_id,
        gudang_id,
        qty,
        status
      )
      VALUES (?, ?, ?, ?, 'pending')
    `;

    db.query(sql, [supplier_id, finalBarangId, gudang_id, qty], (err) => {
      if (err) {
        console.log(err);

        return res.status(500).json({
          message: err.sqlMessage,
        });
      }

      return res.json({
        message: "Purchase Order berhasil dibuat",
      });
    });
  };

  // ======================================================
  // KALAU PILIH BARANG EXISTING
  // ======================================================
  if (barang_id) {
    return insertPO(barang_id);
  }

  // ======================================================
  // KALAU BARANG BARU
  // ======================================================
  if (!nama_barang) {
    return res.status(400).json({
      message: "Nama barang wajib diisi",
    });
  }

  // cek apakah barang sudah ada
  const cekBarang = `
    SELECT *
    FROM barang
    WHERE nama_barang = ?
  `;

  db.query(cekBarang, [nama_barang], (err2, barangResult) => {
    if (err2) {
      console.log(err2);

      return res.status(500).json({
        message: err2.sqlMessage,
      });
    }

    // ==================================================
    // KALAU SUDAH ADA
    // ==================================================
    if (barangResult.length > 0) {
      const existingBarangId = barangResult[0].id;

      return insertPO(existingBarangId);
    }

    // ==================================================
    // INSERT BARANG BARU
    // ==================================================
    const insertBarang = `
        INSERT INTO barang
        (
          nama_barang
        )
        VALUES (?)
      `;

    db.query(insertBarang, [nama_barang], (err3, barangInsertResult) => {
      if (err3) {
        console.log(err3);

        return res.status(500).json({
          message: err3.sqlMessage,
        });
      }

      const newBarangId = barangInsertResult.insertId;

      // insert PO
      return insertPO(newBarangId);
    });
  });
};

// ======================================================
// GET ALL PURCHASE ORDER
// ======================================================
exports.getPurchaseOrder = (req, res) => {
  const sql = `
    SELECT
      purchase_order.*,
      suppliers.nama_supplier,
      barang.nama_barang,
      gudang.nama_gudang

    FROM purchase_order

    LEFT JOIN suppliers
      ON purchase_order.supplier_id = suppliers.id

    LEFT JOIN barang
      ON purchase_order.barang_id = barang.id

    LEFT JOIN gudang
      ON purchase_order.gudang_id = gudang.id

    ORDER BY purchase_order.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: err.sqlMessage,
      });
    }

    res.json(results);
  });
};

// ======================================================
// UPDATE STATUS PURCHASE ORDER
// ======================================================
exports.updateStatusPurchaseOrder = (req, res) => {
  const { id } = req.params;

  const { status } = req.body;

  // VALIDASI STATUS
  if (!["pending", "approved", "received"].includes(status)) {
    return res.status(400).json({
      message: "Status tidak valid",
    });
  }

  // AMBIL DATA PO
  const getPo = `
    SELECT *
    FROM purchase_order
    WHERE id = ?
  `;

  db.query(getPo, [id], (err, poResult) => {
    if (err) {
      console.log(err);

      return res.status(500).json({
        message: err.sqlMessage,
      });
    }

    if (!poResult.length) {
      return res.status(404).json({
        message: "Purchase Order tidak ditemukan",
      });
    }

    const po = poResult[0];

    // UPDATE STATUS
    const updatePo = `
      UPDATE purchase_order
      SET status = ?
      WHERE id = ?
    `;

    db.query(updatePo, [status, id], (err2) => {
      if (err2) {
        console.log(err2);

        return res.status(500).json({
          message: err2.sqlMessage,
        });
      }

      // ==============================================
      // KALAU BUKAN RECEIVED → SELESAI
      // ==============================================
      if (status !== "received") {
        return res.json({
          message: "Status Purchase Order berhasil diupdate",
        });
      }

      // ==============================================
      // CEK SUDAH MASUK BELUM
      // ==============================================
      const cekBarangMasuk = `
          SELECT *
          FROM barang_masuk
          WHERE po_id = ?
        `;

      db.query(cekBarangMasuk, [po.id], (err3, bmResult) => {
        if (err3) {
          console.log(err3);

          return res.status(500).json({
            message: err3.sqlMessage,
          });
        }

        if (bmResult.length > 0) {
          return res.status(400).json({
            message: "PO ini sudah pernah diterima",
          });
        }

        // ==========================================
        // INSERT BARANG MASUK
        // ==========================================
        const insertBarangMasuk = `
              INSERT INTO barang_masuk
              (
                barang_id,
                gudang_id,
                qty,
                tanggal,
                po_id,
                supplier_id,
                catatan
              )
              VALUES (?, ?, ?, NOW(), ?, ?, ?)
            `;

        db.query(
          insertBarangMasuk,
          [
            po.barang_id,
            po.gudang_id,
            po.qty,
            po.id,
            po.supplier_id,
            `Auto dari PO #${po.id}`,
          ],
          (err4) => {
            if (err4) {
              console.log(err4);

              return res.status(500).json({
                message: err4.sqlMessage,
              });
            }

            // ==========================================
            // UPDATE STOK GUDANG
            // ==========================================
            const updateStok = `
                  UPDATE stok_gudang
                  SET stok = stok + ?
                  WHERE barang_id = ?
                  AND gudang_id = ?
                `;

            db.query(
              updateStok,
              [po.qty, po.barang_id, po.gudang_id],
              (err5, result5) => {
                if (err5) {
                  console.log(err5);

                  return res.status(500).json({
                    message: err5.sqlMessage,
                  });
                }

                // ======================================
                // HELPER: SYNC barang.stok DARI stok_gudang
                // ======================================
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
                  db.query(syncSql, [po.barang_id, po.barang_id], callback);
                };

                // ======================================
                // INSERT STOK BARU (belum ada di stok_gudang)
                // ======================================
                if (result5.affectedRows === 0) {
                  const insertStok = `
                        INSERT INTO stok_gudang
                        (
                          barang_id,
                          gudang_id,
                          stok
                        )
                        VALUES (?, ?, ?)
                      `;

                  db.query(
                    insertStok,
                    [po.barang_id, po.gudang_id, po.qty],
                    (err6) => {
                      if (err6) {
                        console.log(err6);

                        return res.status(500).json({
                          message: err6.sqlMessage,
                        });
                      }

                      // ✅ SYNC barang.stok
                      syncBarangStok((err7) => {
                        if (err7) {
                          console.error("SYNC STOK WARNING:", err7);
                        }

                        return res.json({
                          message: "PO diterima & barang masuk berhasil",
                        });
                      });
                    },
                  );
                } else {
                  // ✅ SYNC barang.stok
                  syncBarangStok((err6) => {
                    if (err6) {
                      console.error("SYNC STOK WARNING:", err6);
                    }

                    return res.json({
                      message: "PO diterima & stok berhasil diupdate",
                    });
                  });
                }
              },
            );
          },
        );
      });
    });
  });
};
