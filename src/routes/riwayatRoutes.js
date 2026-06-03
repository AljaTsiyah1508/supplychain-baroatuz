const express = require("express");

const router = express.Router();

const riwayatController = require("../controllers/riwayatController");

const auth = require("../middleware/auth");

const checkRole = require("../middleware/checkRole");

// GET RIWAYAT
router.get(
  "/",
  auth,
  checkRole("admin", "manager", "gudang", "purchasing"),
  riwayatController.getRiwayat,
);

module.exports = router;
