import express from "express";
import { checkJwt, requireAdmin } from "../middleware/auth.js";
import {
  deleteUser,
  getAllUsers,
  getUser,
} from "../controller/user.controller.js";

const router = express.Router();

router.get("/me", checkJwt, getUser);
router.get("/admin/user/", checkJwt, requireAdmin, getAllUsers);
router.patch("/admin/user/:id", checkJwt, requireAdmin, deleteUser);

export default router;
