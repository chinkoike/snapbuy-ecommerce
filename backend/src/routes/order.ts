import express from "express";
import { checkJwt, requireAdmin } from "../middleware/auth.js";
import { createOrder, getAllOrders } from "@/controller/order.controller.js";

const router = express.Router();
router.post("/user/order", checkJwt, createOrder);

router.get("/admin/orders", checkJwt, requireAdmin, getAllOrders);

export default router;
