import express from "express";
import {
  getCategories,
  createCategory,
} from "../controller/category.controller.js";
import { checkJwt, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/categories", getCategories);
router.post("/admin/categories", checkJwt, requireAdmin, createCategory);

export default router;
