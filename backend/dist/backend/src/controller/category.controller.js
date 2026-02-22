// src/controller/category.controller.ts
import { prisma } from "@/lib/prisma.js";
export const getCategories = async (_req, res) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { createdAt: "desc" },
        });
        res.json(categories);
    }
    catch (error) {
        console.error("Get categories error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name?.trim()) {
            return res.status(400).json({ error: "Category name required" });
        }
        const category = await prisma.category.create({
            data: { name },
        });
        res.status(201).json(category);
    }
    catch (error) {
        console.error("Create category error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
//# sourceMappingURL=category.controller.js.map