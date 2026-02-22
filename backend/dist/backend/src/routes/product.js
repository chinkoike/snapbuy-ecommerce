import express from "express";
import { createProduct, toggleProductStatus, getProductById, getProducts, updateProduct, } from "@/controller/product.controller.js";
import { requireAdmin, checkJwt } from "@/middleware/auth.js";
const router = express.Router();
router.get("/products", getProducts);
router.get("/products/:id", getProductById);
// ✅ ต้องมี checkJwt ก่อน
router.post("/admin/products", checkJwt, requireAdmin, createProduct);
router.put("/admin/products/:id", checkJwt, requireAdmin, updateProduct);
router.patch("/admin/products/:id", checkJwt, requireAdmin, toggleProductStatus);
export default router;
//# sourceMappingURL=product.js.map