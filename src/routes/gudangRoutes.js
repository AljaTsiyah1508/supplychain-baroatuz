const express = require("express");
const router = express.Router();

const gudangController = require("../controllers/gudangController");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");

// ======================================================
// CREATE GUDANG
// admin & gudang
// ======================================================
router.post(
  "/",
  auth,
  checkRole("admin", "gudang"),
  gudangController.createGudang,
);

// ======================================================
// GET ALL GUDANG
// monitoring
// ======================================================
router.get(
  "/",
  auth,
  checkRole("admin", "gudang", "manager", "purchasing"),
  gudangController.getGudang,
);

// ======================================================
// UPDATE GUDANG
// admin only
// ======================================================
router.put("/:id", auth, checkRole("admin"), gudangController.updateGudang);

// ======================================================
// DELETE GUDANG
// admin only
// ======================================================
router.delete("/:id", auth, checkRole("admin"), gudangController.deleteGudang);

module.exports = router;
