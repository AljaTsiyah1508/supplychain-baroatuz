const express = require("express");

const router = express.Router();

const laporanController = require("../controllers/laporanController");

const auth = require("../middleware/auth");

const checkRole = require("../middleware/checkRole");

// LAPORAN STOK KRITIS
router.get(
  "/stok-kritis",
  auth,
  checkRole("admin", "manager"),
  laporanController.getStokKritis,
);

// LAPORAN STOK MINIMUM
router.get(
  "/stok-minimum",
  auth,
  checkRole("admin", "manager"),
  laporanController.getStokMinimum,
);

module.exports = router;
