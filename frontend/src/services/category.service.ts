import type { CategoryData } from "../../../shared/types/product";
import { api } from "../lib/axios";

// ดึง Base URL (ไม่ต้องใส่ /api ซ้ำถ้าใน URL หลักมีอยู่แล้ว)

export const categoryService = {
  getAllCategories: async (): Promise<CategoryData[]> => {
    // ใช้ `${API_URL}/categories` เพราะ API_URL เรามี /api ปิดท้ายแล้ว
    const res = await api.get("api/categories");
    return Array.isArray(res.data) ? res.data : res.data.categories || [];
  },
  createCategory: async (categoryName: string): Promise<CategoryData> => {
    // ยิง POST ไปที่ Backend
    const res = await api.post("api/admin/categories", { name: categoryName });
    return res.data;
  },
};
