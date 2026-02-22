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
      return res.status(404).json({
        message: "User not found in local database. Please sync your profile.",
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
export const adminUpdateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // รับค่า status ใหม่จาก Frontend (เช่น "PAID", "SHIPPED", "CANCELLED")

    // 1. ตรวจสอบว่าส่ง status มาไหม
    if (!status) {
      return res
        .status(400)
        .json({ message: "กรุณาระบุสถานะที่ต้องการเปลี่ยน" });
    }

    // 2. อัปเดตสถานะใน Database
    const updatedOrder = await prisma.order.update({
      where: {
        id: id as string, // หรือ Number(id) ตามที่แก้ให้หายแดงเมื่อกี้
      },
      data: {
        status: status, // ค่าต้องตรงกับ Enum OrderStatus ใน Prisma
      },
    });

    return res.status(200).json({
      message: "อัปเดตสถานะออเดอร์เรียบร้อยแล้ว",
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Admin Update Error:", error);

    // กรณีหา ID ไม่เจอ
    if (error.code === "P2025") {
      return res.status(404).json({ message: "ไม่พบรายการคำสั่งซื้อนี้" });
    }

    return res.status(500).json({
      message: "เกิดข้อผิดพลาดในการอัปเดต",
      error: error.message,
    });
  }
};
export const uploadSlip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // เมื่อใช้ multer-storage-cloudinary ไฟล์จะถูกอัปโหลดอัตโนมัติ
    // และ URL จะอยู่ที่ req.file.path (หรือ req.file.secure_url ขึ้นอยู่กับ version)
    const file = req.file as any;

    if (!file) {
      return res.status(400).json({ message: "กรุณาอัปโหลดรูปภาพสลิป" });
    }

    // 1. ดึง URL จาก Cloudinary ที่ Multer เตรียมไว้ให้
    // ปกติจะเป็น file.path หรือ file.secure_url
    const imageUrl = file.path || file.secure_url;

    // 2. บันทึก URL ลง Database และเปลี่ยนสถานะ
    const updatedOrder = await prisma.order.update({
      where: { id: id as string },
      data: {
        slipUrl: imageUrl,
        status: "PENDING", // เปลี่ยนสถานะให้ Admin เห็นในหน้า Dashboard
      },
    });

    return res.status(200).json({
      message: "อัปโหลดสลิปสำเร็จ แอดมินจะรีบตรวจสอบรายการของคุณ",
      url: imageUrl,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Controller Error:", error);
    return res.status(500).json({
      message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล",
      error: error.message,
    });
  }
};
