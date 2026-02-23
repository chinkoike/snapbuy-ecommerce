import type {
  ProductData,
  CreateProductInput,
  GetProductsResponse,
  UpdateProductInput,
} from "../../../shared/types/product";
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
    file: File, // เพิ่ม parameter รับไฟล์รูปภาพ
    token: string,
  ): Promise<ProductData> => {
    // 1. สร้าง FormData และ Append ข้อมูลทั้งหมดเข้าไป
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("price", data.price.toString());
    formData.append("stock", data.stock.toString());
    formData.append("categoryId", data.categoryId);

    // 'image' ต้องตรงกับที่ตั้งไว้ใน Backend (upload.single('image'))
    if (file) {
      formData.append("image", file);
    }

    // 2. ส่ง request โดย Axios จะจัดการ Content-Type ให้เองเมื่อเห็น FormData
    const res = await api.post("/api/admin/products", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        // ไม่ต้องใส่ Content-Type: multipart/form-data นะครับ Axios จัดการให้เอง
      },
    });

    return res.data;
  },

  uploadImage: async (file: File, token: string) => {
    const formData = new FormData();
    formData.append("image", file);

    const res = await api.post("/api/admin/products/upload-image", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data; // จะได้ { imageUrl: "..." }
  },
  update: async (
    id: string,
    data: UpdateProductInput,
    token: string,
  ): Promise<ProductData> => {
    const res = await api.patch(`/api/admin/products/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data; // Backend ต้องส่ง Object สินค้าตัวเต็มกลับมา
  },

  // ใน ProductService.ts
  delete: async (id: string, token: string): Promise<ProductData> => {
    // ระบุ Return Type เป็น ProductData
    const res = await api.patch(
      `/api/admin/products/${id}/status`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return res.data; // ต้องมั่นใจว่า Backend ส่ง object product กลับมา
  },
};
