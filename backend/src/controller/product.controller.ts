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
    const data = req.body;
    const file = req.file as any; // มาจาก uploadCloud.single("image") ใน Route

    // 1. ตรวจสอบไฟล์
    if (!file) {
      return res.status(400).json({ error: "กรุณาอัปโหลดรูปภาพสินค้า" });
    }
    const imageUrl = file.path || file.secure_url;

    // 2. เช็ค Category
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!categoryExists) {
      return res
        .status(400)
        .json({ error: "Invalid categoryId (ไม่พบหมวดหมู่นี้)" });
    }

    // 3. สร้าง Product (แปลงเลขด้วย Number + Math.round)
    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description || "",
        price: Math.round(Number(data.price)) || 0,
        stock: Math.round(Number(data.stock)) || 0,
        imageUrl: imageUrl,
        categoryId: data.categoryId,
      },
      include: { category: true }, // เพื่อให้ Frontend ได้ข้อมูลครบ
    });

    return res.status(201).json(newProduct);
  } catch (error: any) {
    console.error("Create Product Error:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, price, stock, categoryId, imageUrl } = req.body;

  try {
    const updateData: any = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    // ✅ ป้องกัน Bug เรื่องตัวเลข
    if (price !== undefined) updateData.price = Math.round(Number(price));
    if (stock !== undefined) updateData.stock = Math.round(Number(stock));

    if (categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      if (!categoryExists)
        return res.status(400).json({ error: "Invalid categoryId" });
      updateData.categoryId = categoryId;
    }

    const updated = await prisma.product.update({
      where: { id: id as string },
      data: updateData,
      include: { category: true },
    });

    res.json(updated);
  } catch (error: any) {
    console.error("Update Error:", error);
    res.status(500).json({
      error: "Update failed",
      details: error.code === "P2025" ? "ไม่พบสินค้านี้ในระบบ" : error.message,
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
