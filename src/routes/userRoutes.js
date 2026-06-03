const express = require("express");

const router = express.Router();

const auth = require("../middleware/auth");

const checkRole = require("../middleware/checkRole");

const userController = require("../controllers/userController");

// PROFILE
router.get(
  "/profile",
  auth,
  checkRole("admin", "gudang", "purchasing", "manager"),
  userController.getProfile,
);

// ADMIN DASHBOARD
router.get("/admin/dashboard", auth, checkRole("admin"), (req, res) => {
  res.json({
    message: "Welcome Admin",
  });
});

module.exports = router;
