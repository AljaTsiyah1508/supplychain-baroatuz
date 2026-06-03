// Middleware untuk pengecekan role (Rest Parameter)
const checkRole = (...roles) => {
  return (req, res, next) => {
    // Pastikan req.user sudah ada (biasanya dari auth middleware)
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User tidak ditemukan",
      });
    }

    // Cek apakah role user termasuk dalam daftar yang diizinkan
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access forbidden - Anda tidak memiliki izin",
      });
    }

    next();
  };
};

module.exports = checkRole;
