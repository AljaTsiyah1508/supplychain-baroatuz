const db = require("../config/database");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

require("dotenv").config();

// ======================================================
// REGISTER
// ======================================================

exports.register = (req, res) => {
  const { name, email, password, role } = req.body;

  // validasi input
  if (!name || !email || !password || !role) {
    return res.status(400).json({
      success: false,
      message: "Semua field wajib diisi",
    });
  }

  // validasi role
  const allowedRoles = ["user", "gudang", "purchasing", "manager"];

  if (!allowedRoles.includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Role tidak valid",
    });
  }

  // cek email sudah ada atau belum
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      // email sudah terdaftar
      if (results.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email sudah terdaftar",
        });
      }

      try {
        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // insert user
        db.query(
          `INSERT INTO users
          (name, email, password, role)
          VALUES (?, ?, ?, ?)`,
          [name, email, hashedPassword, role],
          (err, result) => {
            if (err) {
              return res.status(500).json({
                success: false,
                message: err.message,
              });
            }

            res.status(201).json({
              success: true,
              message: "Register berhasil",
            });
          },
        );
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    },
  );
};

// ======================================================
// LOGIN
// ======================================================

exports.login = (req, res) => {
  const { email, password } = req.body;

  // validasi input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email dan password wajib diisi",
    });
  }

  // cek email
  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message,
        });
      }

      // email tidak ditemukan
      if (results.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Email atau password salah",
        });
      }

      const user = results[0];

      try {
        // cek password
        const isMatch = await bcrypt.compare(password, user.password);

        // password salah
        if (!isMatch) {
          return res.status(401).json({
            success: false,
            message: "Email atau password salah",
          });
        }

        // generate token
        const token = jwt.sign(
          {
            id: user.id,
            role: user.role,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "24h",
          },
        );

        // response
        res.status(200).json({
          success: true,
          message: "Login berhasil",
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }
    },
  );
};
