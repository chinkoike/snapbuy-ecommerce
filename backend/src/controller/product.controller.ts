import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type {
  ProductDetailResponse,
  ProductListResponse,
} from "../../../shared/types/api.js";
import type { ProductData } from "../../../shared/types/product.js";
import type { CreateProductInput } from "../../../shared/types/product.js";
import { Prisma } from "@prisma/client";

//----------------------get products controller---------------------------------------
export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      categoryId,
      min,
      max,
      page = "1",
      limit = "10",
    } = req.query;

    // ✅ แปลงและกันค่าพัง
    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(50, Math.max(1, Number(limit) || 10));
    // จำกัด limit ไม่เกิน 50 ป้องกันยิง DB หนัก

    const skip = (pageNumber - 1) * limitNumber;

    // ✅ ใช้ Prisma type แทน any
    const where: Prisma.ProductWhereInput = {};
    // 🔍 Search by name
    if (search && typeof search === "string") {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    // 📂 Filter by category name
    if (category && typeof category === "string") {
      where.category = {
        name: category,
      };
    }
    if (categoryId && categoryId !== "null") {
      where.categoryId = String(categoryId);
    }
    // 💰 Filter by price range
    if (min || max) {
      const priceFilter: { gte?: number; lte?: number } = {};

      if (min && !isNaN(Number(min))) priceFilter.gte = Number(min);
      if (max && !isNaN(Number(max))) priceFilter.lte = Number(max);

      if (Object.keys(priceFilter).length > 0) {
        where.price = priceFilter; // ต้องใส่บรรทัดนี้ ข้อมูลราคาถึงจะถูกกรอง
      }
    }

    const [products, totalCount] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limitNumber,
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ]);

    const responseData: ProductListResponse = {
      products,
      pagination: {
        totalItems: totalCount,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalCount / limitNumber),
        limit: limitNumber,
      },
    };

    res.json(responseData);
  } catch (error) {
    console.error("Prisma Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//----------------------get product by id controller---------------------------------------
export const getProductById = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  try {
    const product = await prisma.product.findUnique({
      where: { id: id },
      include: { category: true }, // ต้อง include เพื่อให้ตรงกับ ProductData
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // ระบุ Type ให้ตรงกับที่ frontend คาดหวัง
    const responseData: ProductData = product;
    res.json(responseData);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//----------------------create product controller---------------------------------------
export const createProduct = async (req: Request, res: Response) => {
  try {
    const data: CreateProductInput = req.body;

    // 1. ดึงไฟล์รูปภาพจาก Multer (ที่อัปโหลดไป Cloudinary แล้ว)
    const file = req.file as any;

    // ตรวจสอบว่ามีไฟล์ส่งมาไหม (ถ้า Business Logic บังคับว่าต้องมีรูป)
    if (!file) {
      return res.status(400).json({ error: "กรุณาอัปโหลดรูปภาพสินค้า" });
    }

    // 2. ดึง URL จาก Cloudinary
    // ปกติจะเป็น file.path หรือ file.secure_url ขึ้นอยู่กับการตั้งค่า storage
    const imageUrl = file.path || file.secure_url;

    // 3. เช็ค category ก่อน
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!categoryExists) {
      return res.status(400).json({ error: "Invalid categoryId" });
    }

    // 4. สร้าง Product พร้อมบันทึก imageUrl ที่ได้จาก Cloudinary
    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: Number(data.price), // มั่นใจว่าแปลงเป็น Number เพราะ FormData ส่งมาเป็น String
        stock: Number(data.stock),
        imageUrl: imageUrl, // ใช้ URL จาก Cloudinary แทน data.imageUrl เดิม
        categoryId: data.categoryId,
      },
    });

    return res.status(201).json({
      message: "สร้างสินค้าสำเร็จ",
      product: newProduct,
    });
  } catch (error: any) {
    console.error("Database Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      details: error.message,
    });
  }
};

//----------------------update product controller---------------------------------------
export const updateProduct = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const rawBody: Partial<ProductData> = req.body;
  const file = req.file as any;

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    const dataToUpdate: any = {};

    // ✅ ใช้การเช็คแบบระมัดระวังขึ้น: ต้องมีค่าและไม่เป็น string ว่าง
    if (rawBody.name) dataToUpdate.name = rawBody.name;
    if (rawBody.description !== undefined)
      dataToUpdate.description = rawBody.description;

    // ✅ ตรวจสอบตัวเลขให้ชัวร์
    if (rawBody.price !== undefined && String(rawBody.price) !== "") {
      const p = Number(rawBody.price);
      if (!isNaN(p)) dataToUpdate.price = p;
    }

    // สำหรับ Stock
    if (rawBody.stock !== undefined && String(rawBody.stock) !== "") {
      const s = Number(rawBody.stock);
      if (!isNaN(s)) dataToUpdate.stock = s;
    }
    // จัดการรูปภาพ
    if (file) {
      dataToUpdate.imageUrl = file.path || file.secure_url;
    } else if (rawBody.imageUrl) {
      dataToUpdate.imageUrl = rawBody.imageUrl;
    }

    // ✅ เช็ค CategoryId (ต้องไม่เป็นค่าว่าง)
    if (rawBody.categoryId && rawBody.categoryId !== "") {
      const categoryExists = await prisma.category.findUnique({
        where: { id: rawBody.categoryId },
      });

      if (!categoryExists) {
        return res.status(400).json({ error: "Invalid categoryId" });
      }
      dataToUpdate.categoryId = rawBody.categoryId;
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
      include: { category: true },
    });

    res.json(updatedProduct);
  } catch (error) {
    // 💡 Debug สำคัญ: พิมพ์ error ออกมาดูใน Render Logs
    console.error("DEBUG - Prisma Update Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ----------------------delete product controller---------------------------------------
export const toggleProductStatus = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  if (!id) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // สลับค่า isActive
    const newStatus = !existingProduct.isActive;

    // ถ้ากำลังจะลบ (set false) ให้เช็คเรื่อง Order เหมือนเดิม
    if (newStatus === false) {
      const usedInOrders = await prisma.orderItem.findFirst({
        where: { productId: id },
      });

      if (usedInOrders) {
        return res.status(400).json({
          error: "Cannot deactivate product that is used in orders",
        });
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        isActive: newStatus,
        // ถ้ากลับมา Active ให้ล้าง deletedAt ถ้าลบให้ใส่ Date
        deletedAt: newStatus ? null : new Date(),
      },
    });

    return res.status(200).json(updatedProduct); // ส่ง Object ที่อัปเดตกลับไปเพื่อให้ UI ทราบสถานะใหม่
  } catch (error) {
    console.error("Toggle Product Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
