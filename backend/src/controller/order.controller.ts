import type { Request, Response } from "express";
import { prisma } from "@/lib/prisma.js";
import type { CreateOrderDto, OrderData } from "@/shared/types/order.js";

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    // ระบุ <OrderData[]> เพื่อบอก Prisma ว่าเราคาดหวังผลลัพธ์แบบไหน
    // หรือปล่อยให้มันเป็น Default แล้วไป Cast ตอนส่ง Response
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

    // ใช้ความสามารถของ Express ในการระบุ Type ของสิ่งที่ส่งออกไป
    return res.status(200).json(orders as OrderData[]);
  } catch (error) {
    console.error("Get All Orders Error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const auth0Sub = req.auth?.payload.sub;
    if (!auth0Sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const {
      items,
      totalPrice,
      shippingAddress,
      paymentMethod,
    }: CreateOrderDto = req.body;
    const user = await prisma.user.findUnique({
      where: { auth0Id: auth0Sub },
    });
    if (!user) {
      return res
        .status(404)
        .json({
          message:
            "User not found in local database. Please sync your profile.",
        });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 2. เช็คสินค้าและตัดสต็อก
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || product.stock < item.quantity) {
          throw new Error(`Product ${item.name} is out of stock.`);
        }

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 3. สร้าง Order (ใช้ user.id ที่หาได้จาก DB แน่นอน)
      return await tx.order.create({
        data: {
          userId: user.id, // มั่นใจได้แล้วว่า ID นี้มีอยู่จริง
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
    });

    res.status(201).json(result); // ส่งตัวแปร result (ซึ่งคือ order) กลับไป
  } catch (error) {
    console.error("Checkout Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create order";
    res.status(400).json({ message });
  }
};
