const express = require("express");

const router = express.Router();

const barangKeluarController = require("../controllers/barangKeluarController");

const auth = require("../middleware/auth");

const checkRole = require("../middleware/checkRole");

// CREATE -> gudang & admin
router.post(
  "/",
  auth,
  checkRole("admin", "gudang"),
  barangKeluarController.createBarangKeluar,
);

// READ -> monitoring
router.get(
  "/",
  auth,
  checkRole("admin", "gudang", "manager","purchasing"),
  barangKeluarController.getBarangKeluar,
);

module.exports = router;
