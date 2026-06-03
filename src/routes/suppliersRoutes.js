const express = require("express");
const router = express.Router();

const supplierController = require("../controllers/suppliersController");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");

// ======================================================
// CREATE SUPPLIER
// admin, purchasing, gudang
// ======================================================
router.post(
  "/",
  auth,
  checkRole("admin", "purchasing", "gudang"),
  supplierController.createSupplier,
);

// ======================================================
// GET ALL SUPPLIER
// admin, purchasing, gudang, manager
// ======================================================
router.get(
  "/",
  auth,
  checkRole("admin", "purchasing", "gudang", "manager"),
  supplierController.getSupplier,
);

// ======================================================
// UPDATE SUPPLIER
// admin & purchasing only
// ======================================================
router.put(
  "/:id",
  auth,
  checkRole("admin", "purchasing"),
  supplierController.updateSupplier,
);

// ======================================================
// DELETE SUPPLIER
// admin only
// ======================================================
router.delete(
  "/:id",
  auth,
  checkRole("admin"),
  supplierController.deleteSupplier,
);

module.exports = router;
