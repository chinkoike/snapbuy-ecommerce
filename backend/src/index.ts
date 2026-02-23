import dotenv from "dotenv";
dotenv.config();
import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
// 1. นำเข้า auth
import userRouter from "./routes/user.js";
import productRouter from "./routes/product.js";
import categoryRouter from "./routes/category.js";
import orderRouter from "./routes/order.js";
import adminRouter from "./routes/admin.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(
  cors({
    origin: "https://snapbuy-ecommerce.vercel.app",
    credentials: true,
  }),
);
app.use(express.json());

// Log request (debug)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api", userRouter);
app.use("/api", productRouter);
app.use("/api", categoryRouter);
app.use("/api", orderRouter);
app.use("/api", adminRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("🔥 AUTH ERROR FULL:", err);

  if (err.status === 401) {
    return res.status(401).json({
      message: err.message,
      code: err.code,
    });
  }

  next(err);
});
// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is barking on port ${PORT}`);
});
