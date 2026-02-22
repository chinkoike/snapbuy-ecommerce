// src/routes/category.routes.ts
import express from "express";
import { getCategories, createCategory, } from "@/controller/category.controller.js";
import { requireAdmin } from "@/middleware/auth.js";
const router = express.Router();
router.get("/categories", getCategories);
router.post("/admin/categories", requireAdmin, createCategory);
export default router;
//# sourceMappingURL=category.js.map