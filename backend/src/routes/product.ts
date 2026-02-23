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
  uploadCloud.single("image"),
  createProduct,
);
// ใน product.route.ts
router.post(
  "/admin/products/upload-image",
  checkJwt,
  requireAdmin,
  uploadCloud.single("image"),
  async (req, res) => {
    // ใส่ async ด้วย
    try {
      const file = req.file as any;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // ใช้สูตรเดียวกับ uploadSlip ที่คุณทำได้
      const imageUrl = file.path || file.secure_url;

      console.log("Upload Success:", imageUrl); // ดู Log ใน Render

      return res.json({ imageUrl }); // ส่งกลับไปให้ Frontend เอาไปใส่ payload.imageUrl
    } catch (error: any) {
      console.error("Upload Route Error:", error);
      return res.status(500).json({ error: error.message || "Upload failed" });
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
