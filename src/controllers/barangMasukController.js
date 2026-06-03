const db = require("../config/database");

// ======================================
// CREATE BARANG MASUK + SYNC STOK
// ======================================
exports.createBarangMasuk = (req, res) => {
  const {
    po_id,
    barang_id,
    nama_barang,
    kategori_id,
    gudang_id,
    supplier_id,
    qty,
    satuan,
    tanggal,
    catatan,
  } = req.body;

  // VALIDASI
  if (!gudang_id || !qty) {
    return res.status(400).json({ message: "Gudang dan qty wajib diisi" });
  }
  if (!barang_id && !nama_barang) {
    return res.status(400).json({ message: "Barang wajib diisi" });
  }

  function prosesInsert(finalBarangId) {
    const tgl = tanggal || new Date().toISOString().slice(0, 10);

    const sqlMasuk = `
      INSERT INTO barang_masuk
      (po_id, barang_id, gudang_id, supplier_id, qty, satuan, tanggal, catatan)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      sqlMasuk,
      [
        po_id || null,
        finalBarangId,
        gudang_id,
        supplier_id || null,
        qty,
        satuan || null,
        tgl,
        catatan || null,
      ],
      (err, result) => {
        if (err) {
          console.error("INSERT BARANG MASUK ERROR:", err);
          return res.status(500).json({ message: "Gagal insert barang masuk" });
        }

        // UPDATE / INSERT STOK GUDANG
        const sqlStok = `
          INSERT INTO stok_gudang (barang_id, gudang_id, stok)
          VALUES (?, ?, ?)
          ON DUPLICATE KEY UPDATE stok = stok + VALUES(stok)
        `;

        db.query(sqlStok, [finalBarangId, gudang_id, qty], (errStok) => {
          if (errStok) {
            console.error("UPDATE STOK GUDANG ERROR:", errStok);
            return res
              .status(500)
              .json({ message: "Gagal update stok gudang" });
          }

          // SYNC stok ke tabel barang
          const syncSql = `
            UPDATE barang
            SET stok = (
              SELECT COALESCE(SUM(stok), 0)
              FROM stok_gudang
              WHERE barang_id = ?
            )
            WHERE id = ?
          `;

          db.query(syncSql, [finalBarangId, finalBarangId], (errSync) => {
            if (errSync) {
              console.error("ERROR SYNC BARANG STOK:", errSync);
            }

            res.json({
              message: "Barang masuk berhasil ditambahkan",
              data: {
                barang_id: finalBarangId,
                gudang_id,
                supplier_id: supplier_id || null,
                qty,
              },
            });
          });
        });
      },
    );
  }

  // ==================== AUTO CREATE / UPDATE BARANG ====================
  if (!barang_id) {
    // === Barang baru atau pencarian berdasarkan nama ===
    db.query(
      `SELECT id FROM barang WHERE nama_barang = ? LIMIT 1`,
      [nama_barang],
      (err, rows) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Database error" });
        }

        if (rows.length > 0) {
          // Barang sudah ada → update kategori & supplier
          db.query(
            `
            UPDATE barang
            SET
              kategori_id = COALESCE(?, kategori_id),
              supplier_id = COALESCE(?, supplier_id)
            WHERE id = ?
            `,
            [kategori_id || null, supplier_id || null, rows[0].id],
            (errUpdate) => {
              if (errUpdate)
                console.error("ERROR UPDATE KATEGORI/SUPPLIER:", errUpdate);
              prosesInsert(rows[0].id);
            },
          );
        } else {
          // Buat barang baru
          db.query(
            `
            INSERT INTO barang
            (nama_barang, kategori_id, supplier_id, stok)
            VALUES (?, ?, ?, 0)
            `,
            [nama_barang, kategori_id || null, supplier_id || null],
            (err, result) => {
              if (err) {
                console.error(err);
                return res
                  .status(500)
                  .json({ message: "Gagal membuat barang baru" });
              }
              prosesInsert(result.insertId);
            },
          );
        }
      },
    );
  } else {
    // === Barang dipilih dari dropdown (barang_id ada) ===
    db.query(
      `
      UPDATE barang
      SET
        kategori_id = COALESCE(?, kategori_id),
        supplier_id = COALESCE(?, supplier_id)
      WHERE id = ?
      `,
      [kategori_id || null, supplier_id || null, Number(barang_id)],
      (errUpdate) => {
        if (errUpdate) {
          console.error("ERROR UPDATE KATEGORI/SUPPLIER:", errUpdate);
        }
        prosesInsert(Number(barang_id));
      },
    );
  }
};

// ======================================
// GET ALL BARANG MASUK
// ======================================
exports.getBarangMasuk = (req, res) => {
  const sql = `
    SELECT
      barang_masuk.*,
      barang.nama_barang,
      gudang.nama_gudang,
      suppliers.nama_supplier
    FROM barang_masuk
    LEFT JOIN barang ON barang_masuk.barang_id = barang.id
    LEFT JOIN gudang ON barang_masuk.gudang_id = gudang.id
    LEFT JOIN suppliers ON barang_masuk.supplier_id = suppliers.id
    ORDER BY barang_masuk.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("GET BARANG MASUK ERROR:", err);
      return res.status(500).json({ message: "Gagal mengambil barang masuk" });
    }
    res.json(results);
  });
};
