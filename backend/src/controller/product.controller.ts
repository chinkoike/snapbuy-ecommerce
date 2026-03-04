import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { ProductListResponse } from "../../../shared/types/api.js";
import type { ProductData } from "../../../shared/types/product.js";
import { Prisma } from "@prisma/client";
import redisClient from "../lib/redis.js";

//----------------------get products controller---------------------------------------
export const getProducts = async (req: Request, res: Response) => {
  const sortedQuery = Object.keys(req.query)
    .sort()
    .reduce((obj: any, key) => {
      obj[key] = req.query[key];
      return obj;
    }, {});
  const cacheKey = `products:${JSON.stringify(sortedQuery)}`;

  let cachedData = null;

  // 2. พยายามดึงจาก Cache (ถ้า Redis พัง ให้ข้ามไป DB แทน ไม่ให้ App ล่ม)
  try {
    if (redisClient.isReady) {
      cachedData = await redisClient.get(cacheKey);
    }
  } catch (err) {
    console.error("Redis Cache Error:", err);
  }

  if (cachedData) {
    return res.json({
      success: true,
      data: JSON.parse(cachedData),
      from: "cache",
    });
  }
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

    const pageNumber = Math.max(1, Number(page) || 1);
    const limitNumber = Math.min(50, Math.max(1, Number(limit) || 10));
    // จำกัด limit ไม่เกิน 50 ป้องกันยิง DB หนัก

    const skip = (pageNumber - 1) * limitNumber;

    // ใช้ Prisma type แทน any
    const where: Prisma.ProductWhereInput = {};
    if (search && typeof search === "string") {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    //  Filter by category name
    if (category && typeof category === "string") {
      where.category = {
        name: category,
      };
    }
    if (categoryId && categoryId !== "null") {
      where.categoryId = String(categoryId);
    }
    //  Filter by price range
    if (min || max) {
      const priceFilter: { gte?: number; lte?: number } = {};

      if (min && !isNaN(Number(min))) priceFilter.gte = Number(min);
      if (max && !isNaN(Number(max))) priceFilter.lte = Number(max);

      if (Object.keys(priceFilter).length > 0) {
        where.price = priceFilter;
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
    if (redisClient.isReady) {
      redisClient
        .setEx(cacheKey, 600, JSON.stringify(responseData))
        .catch((err) => console.error("Redis Set Error:", err));
    }
    res.json({ success: true, data: responseData });
  } catch (error: unknown) {
    console.error("Error context:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ success: false, error: errorMessage });
  }
};

//----------------------get product by id controller---------------------------------------
export const getProductById = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const cacheKey = `product${id}`;

  try {
    if (redisClient.isReady) {
      const cacheProduct = await redisClient.get(cacheKey);
      if (cacheProduct) {
        return res.json({
          success: true,
          data: JSON.parse(cacheProduct),
          from: "cache",
        });
      }
    }
    const product = await prisma.product.findUnique({
      where: { id: id },
      include: { category: true },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const responseData: ProductData = product;

    if (redisClient.isReady) {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData));
    }
    res.json({ success: true, data: responseData });
  } catch (error: unknown) {
    console.error("Error context:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ success: false, error: errorMessage });
  }
};

//----------------------create product controller---------------------------------------
export const createProduct = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const file = req.file as any;

    if (!file) {
      return res.status(400).json({ error: "Please upload product images" });
    }
    const imageUrl = file.path || file.secure_url;

    const categoryExists = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!categoryExists) {
      return res.status(400).json({ error: "Invalid categoryId" });
    }

    const newProduct = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description || "",
        price: Math.round(Number(data.price)) || 0,
        stock: Math.round(Number(data.stock)) || 0,
        imageUrl: imageUrl,
        categoryId: data.categoryId,
      },
      include: { category: true },
    });
    const keys = await redisClient.keys("products:*");
    if (keys.length > 0) await redisClient.del(keys);
    return res.status(201).json({ success: true, data: newProduct });
  } catch (error: unknown) {
    console.error("Error context:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ success: false, error: errorMessage });
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

    if (redisClient.isReady) {
      await redisClient.del(`product:${id}`);

      const keys = await redisClient.keys("products:*");
      if (keys.length > 0) await redisClient.del(keys);
    }
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    console.error("Error context:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ success: false, error: errorMessage });
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
        deletedAt: newStatus ? null : new Date(),
      },
    });
    if (redisClient.isReady) {
      await redisClient.del(`product:${id}`);

      const keys = await redisClient.keys("products:*");
      if (keys.length > 0) await redisClient.del(keys);
    }
    return res.status(200).json({ success: true, data: updatedProduct });
  } catch (error: unknown) {
    console.error("Error context:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    res.status(500).json({ success: false, error: errorMessage });
  }
};
