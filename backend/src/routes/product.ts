import express from "express";
import {
  createProduct,
  toggleProductStatus,
  getProductById,
  getProducts,
  updateProduct,
} from "../controller/product.controller.js";
import { requireAdmin, checkJwt } from "../middleware/auth.js";
import { uploadCloud } from "../lib/cloudinary.js";

const router = express.Router();

router.get("/products", getProducts);
router.get("/products/:id", getProductById);

// ✅ ต้องมี checkJwt ก่อน
router.post(
  "/admin/products",
  checkJwt,
  requireAdmin,

  createProduct,
);
router.post(
  "/admin/products/upload-image",
  checkJwt,
  requireAdmin,
  uploadCloud.single("image"),
  (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const imageUrl = req.file.path;
      res.json({ imageUrl });
    } catch (error) {
      res.status(500).json({ error: "Upload failed" });
    }
  },
);

// เส้นที่ 2: สำหรับอัปเดตข้อมูลสินค้า (รับ JSON ล้วนๆ ไม่ต้องมี uploadCloud)
router.patch(
  "/admin/products/:id",
  checkJwt,
  requireAdmin,
  updateProduct, // ตัว Controller เดิมแต่ปรับให้รับ JSON
);
router.patch(
  "/admin/products/:id/status",
  checkJwt,
  requireAdmin,
  toggleProductStatus,
);

export default router;
