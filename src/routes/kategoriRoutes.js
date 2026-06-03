const express = require("express");
const router = express.Router();

const kategoriController = require("../controllers/kategoriController");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");

// ======================================================
// GET ALL KATEGORI
// ======================================================
router.get(
  "/",
  auth,
  checkRole("admin", "gudang", "manager", "purchasing"),
  kategoriController.getKategori,
);

// ======================================================
// CREATE KATEGORI
// admin & gudang
// ======================================================
router.post(
  "/",
  auth,
  checkRole("admin", "gudang"),
  kategoriController.createKategori,
);

// ======================================================
// UPDATE KATEGORI
// admin only
// ======================================================
router.put("/:id", auth, checkRole("admin"), kategoriController.updateKategori);

// ======================================================
// DELETE KATEGORI
// admin only
// ======================================================
router.delete(
  "/:id",
  auth,
  checkRole("admin"),
  kategoriController.deleteKategori,
);

module.exports = router;
