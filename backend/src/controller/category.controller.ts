import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: "Category name required" });
    }
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, error: "Category already exists" });
    }
    const category = await prisma.category.create({
      data: { name },
    });

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
