import type {
  ProductData,
  CreateProductInput,
  UpdateProductInput,
  GetProductsResponse,
} from "@/shared/types/product";
import { api } from "../lib/axios";

export const ProductService = {
  getAll: async (
    categoryId?: string | null,
    page: number = 1,
    search: string = "",
  ): Promise<GetProductsResponse> => {
    const res = await api.get("/api/products", {
      params: {
        page,
        search,
        // ถ้า categoryId เป็น null หรือว่าง axios จะไม่ส่ง query นี้ไป
        ...(categoryId && { categoryId }),
      },
    });
    return res.data;
  },

  getById: async (id: string): Promise<ProductData> => {
    const res = await api.get(`/api/products/${id}`);
    return res.data;
  },

  // **แก้ตรงนี้**: เปลี่ยน data เป็น CreateProductInput
  create: async (
    data: CreateProductInput,
    token: string,
  ): Promise<ProductData> => {
    console.log("TOKEN:", token);

    const res = await api.post("/api/admin/products", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  update: async (
    id: string,
    data: UpdateProductInput,
    token: string,
  ): Promise<ProductData> => {
    // ✅ ต้องส่งเป็น { headers: { Authorization: `Bearer ${token}` } }
    const res = await api.put(`/api/admin/products/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },

  // ใน ProductService.ts
  delete: async (id: string, token: string): Promise<ProductData> => {
    // ระบุ Return Type เป็น ProductData
    const res = await api.patch(
      `/api/admin/products/${id}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return res.data; // ต้องมั่นใจว่า Backend ส่ง object product กลับมา
  },
};
