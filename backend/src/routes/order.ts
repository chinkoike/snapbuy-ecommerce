import express from "express";
import { checkJwt, requireAdmin } from "../middleware/auth.js";
import {
  adminUpdateOrderStatus,
  createOrder,
  getAllOrders,
  uploadSlip,
} from "@/controller/order.controller.js";
import { uploadCloud } from "@/lib/cloudinary.js";

const router = express.Router();
router.post("/user/order", checkJwt, createOrder);
router.patch(
  "/:id/upload-slip",
  checkJwt,
  uploadCloud.single("slip"),
  uploadSlip,
);

router.get("/admin/orders", checkJwt, requireAdmin, getAllOrders);
router.patch(
  "/admin/orders/:id/status",
  checkJwt,
  requireAdmin,
  adminUpdateOrderStatus,
);
export default router;
