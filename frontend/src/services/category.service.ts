import type { CategoryData } from "../../../shared/types/product";
import { api } from "../lib/axios";

export const categoryService = {
  getAllCategories: async (): Promise<CategoryData[]> => {
    const res = await api.get("api/categories");
    return Array.isArray(res.data) ? res.data : res.data.categories || [];
  },
  createCategory: async (
    categoryName: string,
    token: string,
  ): Promise<CategoryData> => {
    const res = await api.post(
      "api/admin/categories",
      { name: categoryName },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    return res.data;
  },
};
