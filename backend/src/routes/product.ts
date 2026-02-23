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
  uploadCloud.single("image"), // <--- ต้องมีบรรทัดนี้!
  createProduct,
);
router.put("/admin/products/:id", checkJwt, requireAdmin, updateProduct);
router.patch(
  "/admin/products/:id",
  checkJwt,
  requireAdmin,
  toggleProductStatus,
);

export default router;
