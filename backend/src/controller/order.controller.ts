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
        userId: user.id, // ใช้ UUID ของ User จาก DB
      },
      include: {
        items: {
          include: {
            product: true, // ดึงข้อมูลสินค้าไปด้วยเพื่อไปโชว์ใน Profile
          },
        },
      },
      orderBy: {
        createdAt: "desc", // เอาอันล่าสุดขึ้นก่อน
      },
    });

    return res.status(200).json(orders);
  } catch (error) {
    console.error("Get My Orders Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
// สำหรับดึงออเดอร์ใบเดียว (ใช้ตอน Refresh หน้า Success)
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const auth0Id = (req as any).auth?.payload?.sub; // นี่คือ "auth0|..."

    // ไปหา User ใน DB ก่อนว่า auth0|... คนนี้ มี ID ในระบบเราคืออะไร
    const user = await prisma.user.findUnique({
      where: { auth0Id: auth0Id }, // สมมติว่าในตาราง User คุณเก็บ auth0Id ไว้
    });

    if (!user) {
      return res.status(404).json({ error: "User not found in system" });
    }

    // ดึง Order ออกมา
    const order = await prisma.order.findUnique({
      where: { id: id as string },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // เทียบ ID จาก Database กับ Database (UUID vs UUID)
    if (order.userId !== user.id) {
      console.log(`Mismatch Fixed: ${order.userId} vs ${user.id}`);
      return res.status(403).json({ error: "Access denied" });
    }

    return res.status(200).json(order);
  } catch (error) {
    return res.status(500).json({ error: "Server error" });
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
            //  ถ้าใน item ไม่มี name ให้ดึงจาก product ที่หาเจอใน DB แทน
            throw new Error(
              `Product ${product?.name || item.productId} is out of stock.`,
            );
          }

          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });
        }

        // สร้าง Order (ใช้ user.id ที่หาได้จาก DB แน่นอน)
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
      },
    );

    res.status(201).json(result); // ส่งตัวแปร result (ซึ่งคือ order) กลับไป
  } catch (error) {
    console.error("Checkout Error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create order";
    res.status(400).json({ message });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  const { id } = req.params; // order id
  const auth0Id = req.auth?.payload?.sub; // ดึง sub จาก Auth0 payload

  if (!auth0Id) {
    return res.status(401).json({ message: "Unauthorized: No sub found" });
  }

  try {
    //  หา User ใน DB ของเราด้วย auth0Id (sub)
    const user = await prisma.user.findUnique({
      where: { auth0Id: auth0Id },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found in database" });
    }

    // หา Order ที่ตรงกับ ID และเป็นของ User คนนี้ + สถานะต้องเป็น PENDING
    const order = await prisma.order.findFirst({
      where: {
        id: id as string,
        userId: user.id, // ใช้ ID User
        status: "PENDING",
      },
      include: { items: true }, // ดึงสินค้าในออเดอร์มาเพื่อคืนสต็อก
    });

    if (!order) {
      return res
        .status(404)
        .json({ message: "ไม่พบออเดอร์ที่สามารถยกเลิกได้" });
    }

    // เริ่มกระบวนการ Transaction (ต้องสำเร็จทั้งหมด หรือไม่สำเร็จเลย)
    await prisma.$transaction(async (tx) => {
      // อัปเดตสถานะออเดอร์เป็น CANCELLED
      await tx.order.update({
        where: { id: id as string },
        data: { status: "CANCELLED" },
      });

      //  วนลูปคืนสต็อกสินค้าตามจำนวนที่สั่ง
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity }, // เพิ่มค่าสต็อกกลับเข้าไป
          },
        });
      }
    });

    res.json({ message: "ยกเลิกออเดอร์สำเร็จ สต็อกถูกคืนเข้าระบบแล้ว" });
  } catch (error: unknown) {
    console.error("Cancel Order Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
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

    //  ดึง URL จาก Cloudinary ที่ Multer เตรียมไว้ให้
    // ปกติจะเป็น file.path หรือ file.secure_url
    const imageUrl = file.path || file.secure_url;

    //  บันทึก URL ลง Database และเปลี่ยนสถานะ
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

//-------------------admin----------------------------------//
export const adminUpdateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // รับค่า status ใหม่จาก Frontend (เช่น "PAID", "SHIPPED", "CANCELLED")

    // ตรวจสอบว่าส่ง status มาไหม
    if (!status) {
      return res
        .status(400)
        .json({ message: "กรุณาระบุสถานะที่ต้องการเปลี่ยน" });
    }

    // อัปเดตสถานะใน Database
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
