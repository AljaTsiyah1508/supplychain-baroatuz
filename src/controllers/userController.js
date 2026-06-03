const db = require("../config/database");

exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, email, role FROM users WHERE id = ?", [
      req.user.id,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({ data: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
