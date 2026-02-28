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
        ...(categoryId && { categoryId }),
      },
    });
    return res.data.data;
  },

  getById: async (id: string): Promise<ProductData> => {
    const res = await api.get(`/api/products/${id}`);
    return res.data.data;
  },

  create: async (
    data: CreateProductInput,
    file: File,
    token: string,
  ): Promise<ProductData> => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("price", data.price.toString());
    formData.append("stock", data.stock.toString());
    formData.append("categoryId", data.categoryId);

    if (file) {
      formData.append("image", file);
    }

    const res = await api.post("/api/admin/products", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.data;
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
    return res.data.data;
  },
  update: async (
    id: string,
    data: UpdateProductInput,
    token: string,
  ): Promise<ProductData> => {
    const res = await api.patch(`/api/admin/products/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
  },

  delete: async (id: string, token: string): Promise<ProductData> => {
    const res = await api.patch(
      `/api/admin/products/${id}/status`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return res.data.data;
  },
};
