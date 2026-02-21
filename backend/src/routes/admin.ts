// src/routes/category.routes.ts

import express from "express";

import { checkJwt, requireAdmin } from "@/middleware/auth.js";
import { getAdminDashboardStats } from "@/controller/admin.controller.js";

const router = express.Router();

router.get("/admin/stats", checkJwt, requireAdmin, getAdminDashboardStats);

export default router;
