const express = require("express");

const router = express.Router();

const purchaseOrderController = require("../controllers/purchaseOrderController");

const auth = require("../middleware/auth");

const checkRole = require("../middleware/checkRole");

// CREATE PO
router.post(
  "/",
  auth,
  checkRole("admin", "purchasing"),
  purchaseOrderController.createPurchaseOrder,
);

// GET ALL PO
router.get(
  "/",
  auth,
  checkRole("admin", "purchasing", "manager", "gudang"),
  purchaseOrderController.getPurchaseOrder,
);

// UPDATE STATUS PO
router.put(
  "/:id",
  auth,
  checkRole("admin", "manager", "purchasing"),
  purchaseOrderController.updateStatusPurchaseOrder,
);

module.exports = router;
