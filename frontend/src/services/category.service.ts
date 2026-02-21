// src/services/categoryService.ts
import axios from "axios";
import type { CategoryData } from "@/shared/types/product";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

export const categoryService = {
  // ฟังก์ชันดึงหมวดหมู่ทั้งหมด
  getAllCategories: async (): Promise<CategoryData[]> => {
    const res = await axios.get(`${API_URL}/api/categories`);
    // จัดการโครงสร้างข้อมูลให้เป็น Array เสมอ
    return Array.isArray(res.data) ? res.data : res.data.categories;
  },

  // คุณสามารถเพิ่มฟังก์ชันอื่นๆ ได้ในอนาคต เช่น
  // getCategoryById: async (id: string) => { ... },
};
