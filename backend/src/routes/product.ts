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

router.post(
  "/admin/products",
  checkJwt,
  requireAdmin,
  uploadCloud.single("image"),
  createProduct,
);
router.post(
  "/admin/products/upload-image",
  checkJwt,
  requireAdmin,
  uploadCloud.single("image"),
  async (req, res) => {
    try {
      const file = req.file as any;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const imageUrl = file.path || file.secure_url;

      console.log("Upload Success:", imageUrl);

      return res.json({ imageUrl });
    } catch (error: any) {
      console.error("Upload Route Error:", error);
      return res.status(500).json({ error: error.message || "Upload failed" });
    }
  },
);

router.patch("/admin/products/:id", checkJwt, requireAdmin, updateProduct);
router.patch(
  "/admin/products/:id/status",
  checkJwt,
  requireAdmin,
  toggleProductStatus,
);

export default router;
