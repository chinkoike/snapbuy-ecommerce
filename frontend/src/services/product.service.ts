import type {
  ProductData,
  CreateProductInput,
  GetProductsResponse,
  UpdateProductPayload,
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

  update: async (
    id: string,
    data: UpdateProductPayload,
    token: string,
    file: File,
  ) => {
    const formData = new FormData();

    // 1. วนลูปใส่ข้อมูล Text ทั้งหมด
    (Object.keys(data) as Array<keyof UpdateProductPayload>).forEach((key) => {
      if (data[key] !== undefined && key !== "imageFile") {
        formData.append(key, String(data[key]));
      }
    });

    // 2. ถ้ามีไฟล์รูปภาพใหม่ ให้ append เข้าไป
    if (file) {
      formData.append("image", file);
    }

    const res = await api.patch(`/api/admin/products/${id}`, formData, {
      headers: { Authorization: `Bearer ${token}` },
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
