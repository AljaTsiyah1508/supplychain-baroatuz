const jwt = require("jsonwebtoken");

require("dotenv").config();

const auth = (req, res, next) => {
  // ambil header authorization
  const authHeader = req.headers.authorization;

  // ambil token
  const token = authHeader && authHeader.split(" ")[1];

  // cek token ada atau tidak
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token tidak ada",
    });
  }

  try {
    // verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // simpan data user
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token tidak valid",
    });
  }
};

module.exports = auth;
