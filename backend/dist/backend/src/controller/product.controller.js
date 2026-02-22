import { prisma } from "@/lib/prisma.js";
import { Prisma } from "@prisma/client";
//----------------------get products controller---------------------------------------
export const getProducts = async (req, res) => {
    try {
        const { search, category, categoryId, min, max, page = "1", limit = "10", } = req.query;
        // ✅ แปลงและกันค่าพัง
        const pageNumber = Math.max(1, Number(page) || 1);
        const limitNumber = Math.min(50, Math.max(1, Number(limit) || 10));
        // จำกัด limit ไม่เกิน 50 ป้องกันยิง DB หนัก
        const skip = (pageNumber - 1) * limitNumber;
        // ✅ ใช้ Prisma type แทน any
        const where = {};
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
            const priceFilter = {};
            if (min && !isNaN(Number(min)))
                priceFilter.gte = Number(min);
            if (max && !isNaN(Number(max)))
                priceFilter.lte = Number(max);
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
        const responseData = {
            products,
            pagination: {
                totalItems: totalCount,
                currentPage: pageNumber,
                totalPages: Math.ceil(totalCount / limitNumber),
                limit: limitNumber,
            },
        };
        res.json(responseData);
    }
    catch (error) {
        console.error("Prisma Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
//----------------------get product by id controller---------------------------------------
export const getProductById = async (req, res) => {
    const id = req.params.id;
    try {
        const product = await prisma.product.findUnique({
            where: { id: id },
            include: { category: true }, // ต้อง include เพื่อให้ตรงกับ ProductData
        });
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }
        // ระบุ Type ให้ตรงกับที่ frontend คาดหวัง
        const responseData = product;
        res.json(responseData);
    }
    catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
//----------------------create product controller---------------------------------------
export const createProduct = async (req, res) => {
    const data = req.body;
    try {
        // 1️⃣ เช็ค category ก่อน
        const categoryExists = await prisma.category.findUnique({
            where: { id: data.categoryId },
        });
        if (!categoryExists) {
            return res.status(400).json({ error: "Invalid categoryId" });
        }
        // 2️⃣ แปลงตัวเลข
        const newProduct = await prisma.product.create({
            data: {
                name: data.name,
                description: data.description,
                price: Number(data.price),
                stock: Number(data.stock),
                imageUrl: data.imageUrl || null,
                categoryId: data.categoryId,
            },
        });
        res.status(201).json(newProduct);
    }
    catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
//----------------------update product controller---------------------------------------
export const updateProduct = async (req, res) => {
    const id = req.params.id;
    const rawBody = req.body;
    try {
        const existingProduct = await prisma.product.findUnique({
            where: { id },
        });
        if (!existingProduct) {
            return res.status(404).json({ error: "Product not found" });
        }
        const dataToUpdate = {};
        if (rawBody.name !== undefined)
            dataToUpdate.name = rawBody.name;
        if (rawBody.description !== undefined)
            dataToUpdate.description = rawBody.description;
        if (rawBody.price !== undefined)
            dataToUpdate.price = Number(rawBody.price);
        if (rawBody.stock !== undefined)
            dataToUpdate.stock = Number(rawBody.stock);
        if (rawBody.imageUrl !== undefined)
            dataToUpdate.imageUrl = rawBody.imageUrl;
        // ✅ ถ้ามีการเปลี่ยน categoryId ต้องเช็คก่อน
        if (rawBody.categoryId !== undefined) {
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
        const responseData = updatedProduct;
        res.json(responseData);
    }
    catch (error) {
        console.error("Update Product Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
// ----------------------delete product controller---------------------------------------
export const toggleProductStatus = async (req, res) => {
    const id = req.params.id;
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
    }
    catch (error) {
        console.error("Toggle Product Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
//# sourceMappingURL=product.controller.js.map