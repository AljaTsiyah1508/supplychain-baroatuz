require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const barangRoutes = require("./routes/barangRoutes");
const supplierRoutes = require("./routes/suppliersRoutes");
const gudangRoutes = require("./routes/gudangRoutes");
const stokGudangRoutes = require("./routes/stokGudangRoutes");
const barangMasukRoutes = require("./routes/barangMasukRoutes");
const barangKeluarRoutes = require("./routes/barangKeluarRoutes");
const mutasiGudangRoutes = require("./routes/mutasiGudangRoutes");
const purchaseOrderRoutes = require("./routes/purchaseOrderRoutes");
const riwayatRoutes = require("./routes/riwayatRoutes");
const laporanRoutes = require("./routes/laporanRoutes");
const kategoriRoutes = require("./routes/kategoriRoutes");

const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

app.use(cors());
app.use(express.json());

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/barang", barangRoutes);
app.use("/gudang", gudangRoutes);
app.use("/supplier", supplierRoutes);
app.use("/stok-gudang", stokGudangRoutes);
app.use("/barang-masuk", barangMasukRoutes);
app.use("/barang-keluar", barangKeluarRoutes);
app.use("/mutasi-gudang", mutasiGudangRoutes);
app.use("/purchase-order", purchaseOrderRoutes);
app.use("/riwayat", riwayatRoutes);
app.use("/laporan", laporanRoutes);
app.use("/kategori", kategoriRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Backend Supply Chain - Auth API" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`JWT_SECRET loaded: ${!!process.env.JWT_SECRET}`);
});
