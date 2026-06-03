const express = require("express");

const router = express.Router();

const stokGudangController = require("../controllers/stokGudangController");

const auth = require("../middleware/auth");

const checkRole = require("../middleware/checkRole");

// CREATE INITIAL STOCK
router.post(
  "/",
  auth,
  checkRole("admin"),
  stokGudangController.createStokGudang,
);

// READ STOK
router.get(
  "/",
  auth,
  checkRole("admin", "gudang", "manager", "purchasing"),
  stokGudangController.getStokGudang,
);

// STOCK ADJUSTMENT
router.put(
  "/:id",
  auth,
  checkRole("admin"),
  stokGudangController.updateStokGudang,
);

// DELETE
router.delete(
  "/:id",
  auth,
  checkRole("admin"),
  stokGudangController.deleteStokGudang,
);

module.exports = router;
