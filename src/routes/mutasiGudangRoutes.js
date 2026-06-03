const express = require("express");

const router = express.Router();

const mutasiGudangController = require("../controllers/mutasiGudangController");

const auth = require("../middleware/auth");

const checkRole = require("../middleware/checkRole");

// CREATE -> gudang & admin
router.post(
  "/",
  auth,
  checkRole("admin", "gudang"),
  mutasiGudangController.createMutasiGudang,
);

// READ -> monitoring
router.get(
  "/",
  auth,
  checkRole("admin", "gudang", "manager", "purchasing"),
  mutasiGudangController.getMutasiGudang,
);

module.exports = router;
