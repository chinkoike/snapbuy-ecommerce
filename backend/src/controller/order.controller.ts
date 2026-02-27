import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { CreateOrderDto, OrderData } from "../../../shared/types/order.js";
import type { Prisma } from "@prisma/client";

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    //  ดึง Auth0 ID จาก Token (Middleware: express-oauth2-jwt-bearer)
    const auth0Id = (req as any).auth?.payload?.sub;

    if (!auth0Id) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    // หา User ใน DB ของเราก่อน เพื่อเอา UUID จริงๆ มาใช้
    const user = await prisma.user.findUnique({
      where: { auth0Id: auth0Id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found in database" });
    }

    //  ดึงเฉพาะ Order ที่เป็นของ User คนนี้
    const orders = await prisma.order.findMany({
      where: {
        userId: user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({ success: true, data: orders });
  } catch (error: unknown) {
    console.error("Error context:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ success: false, error: errorMessage });
  }
};
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const auth0Id = (req as any).auth?.payload?.sub;

    // ไปหา User ใน DB ก่อนว่า auth0 คนนี้ มี ID ในระบบเราคืออะไร
    const user = await prisma.user.findUnique({
      where: { auth0Id: auth0Id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found in system" });
    }

    const order = await prisma.order.findUnique({
      where: { id: id as string },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.userId !== user.id) {
      console.log(`Mismatch Fixed: ${order.userId} vs ${user.id}`);
      return res.status(403).json({ error: "Access denied" });
    }

    return res.status(200).json({ success: true, data: order });
  } catch (error: unknown) {
    console.error("Error context:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ success: false, error: errorMessage });
  }
};
export const createOrder = async (req: Request, res: Response) => {
  try {
    const auth0Id = req.auth?.payload.sub;
    if (!auth0Id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const {
      items,
      totalPrice,
      shippingAddress,
      paymentMethod,
    }: CreateOrderDto = req.body;
    const user = await prisma.user.findUnique({
      where: { auth0Id: auth0Id },
    });
    if (!user) {
      return res.status(404).json({
        message: "User not found in local database. Please sync your profile.",
      });
    }

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // เช็คสินค้าและตัดสต็อก
        for (const item of items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product || product.stock < item.quantity) {
            throw new Error(
              `Product ${product?.name || item.productId} is out of stock.`,
            );
          }

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        return await tx.order.create({
          data: {
            userId: user.id,
            totalPrice: totalPrice,
            status: "PENDING",
            items: {
              create: items.map((item) => ({
                quantity: item.quantity,
                priceAtPurchase: item.price,
                productId: item.productId,
              })),
            },
          },
          include: {
            items: true,
          },
        });
      },
    );

    res.status(201).json({ success: true, data: result });
  } catch (error: unknown) {
    console.error("Error context:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ success: false, error: errorMessage });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  const { id } = req.params;
  const auth0Id = req.auth?.payload?.sub;
  if (!auth0Id) {
    return res.status(401).json({ message: "Unauthorized: No sub found" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id: auth0Id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found in database" });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: id as string,
        userId: user.id,
        status: "PENDING",
      },
      include: { items: true },
    });

    if (!order) {
      return res
        .status(404)
        .json({ message: "No orders were found that could be canceled" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: id as string },
        data: { status: "CANCELLED" },
      });

      //  วนลูปคืนสต็อกสินค้าตามจำนวนที่สั่ง
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
          },
        });
      }
    });

    res.json({ message: "Order successfully cancelled" });
  } catch (error: unknown) {
    console.error("Error context:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ success: false, error: errorMessage });
  }
};

export const uploadSlip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    //URL จะอยู่ที่ req.file.path
    const file = req.file as any;

    if (!file) {
      return res
        .status(400)
        .json({ error: "Please upload a picture of the receipt" });
    }

    //  ดึง URL จาก Cloudinary ที่ Multer เตรียมไว้ให้
    const imageUrl = file.path || file.secure_url;

    //  บันทึก URL ลง Database และเปลี่ยนสถานะ
    const updatedOrder = await prisma.order.update({
      where: { id: id as string },
      data: {
        slipUrl: imageUrl,
        status: "PENDING",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Payment slip uploaded successfully",
      url: imageUrl,
      order: updatedOrder,
    });
  } catch (error: unknown) {
    console.error("Error context:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ success: false, error: errorMessage });
  }
};

//-------------------admin----------------------------------//
export const adminUpdateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // ตรวจสอบว่าส่ง status มาไหม
    if (!status) {
      return res
        .status(400)
        .json({ error: "Please specify the status you wish to change" });
    }

    // อัปเดตสถานะใน Database
    const updatedOrder = await prisma.order.update({
      where: {
        id: id as string,
      },
      data: {
        status: status,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Order status has been successfully updated",
      data: updatedOrder,
    });
  } catch (error: unknown) {
    console.error("Error context:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ success: false, error: errorMessage });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      count: orders.length,
      data: orders as OrderData[],
    });
  } catch (error: unknown) {
    console.error("Error context:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ success: false, error: errorMessage });
  }
};
