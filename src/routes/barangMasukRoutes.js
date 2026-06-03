const express = require("express");

const router = express.Router();

const barangMasukController = require("../controllers/barangMasukController");

const auth = require("../middleware/auth");

const checkRole = require("../middleware/checkRole");

// CREATE -> gudang & admin
router.post(
  "/",
  auth,
  checkRole("admin", "gudang"),
  barangMasukController.createBarangMasuk,
);

// READ -> monitoring
router.get(
  "/",
  auth,
  checkRole("admin", "gudang", "manager", "purchasing"),
  barangMasukController.getBarangMasuk,
);

module.exports = router;
