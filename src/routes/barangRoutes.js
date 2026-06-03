const express = require("express");

const router = express.Router();

const barangController = require("../controllers/barangController");

const auth = require("../middleware/auth");

const checkRole = require("../middleware/checkRole");

// CREATE -> admin only
router.post("/", auth, checkRole("admin"), barangController.createBarang);

// READ -> semua role terkait
router.get(
  "/",
  auth,
  checkRole("admin", "gudang", "purchasing", "manager"),
  barangController.getBarang,
);

// UPDATE -> admin only
router.put("/:id", auth, checkRole("admin"), barangController.updateBarang);

// DELETE -> admin only
router.delete("/:id", auth, checkRole("admin"), barangController.deleteBarang);

module.exports = router;
