import { create } from "zustand";
import { ProductService } from "../services/product.service";
import type {
  CreateProductInput,
  ProductState,
} from "../../../shared/types/product";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  return "Something went wrong";
};

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  loading: false,
  error: null,
  totalPages: 1,

  fetchProducts: async (categoryId, page = 1, search = "") => {
    try {
      set({ loading: true, error: null });
      const data = await ProductService.getAll(categoryId, page, search);

      set({
        products: Array.isArray(data) ? data : data.products,
        totalPages: data.totalPages,
        loading: false,
      });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), loading: false });
    }
  },

  createProduct: async (
    data: CreateProductInput,
    file: File,
    token: string,
  ) => {
    try {
      set({ loading: true, error: null });

      // ส่งทั้ง data และ file ไปที่ Service
      const newProduct = await ProductService.create(data, file, token);

      set((state) => ({
        products: [...state.products, newProduct],
        loading: false,
      }));
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), loading: false });
    }
  },

  updateProduct: async (id, data, file, token) => {
    set({ loading: true, error: null });
    try {
      // ✅ เปลี่ยนจาก let เป็น const เพราะเราแค่ "แก้ไข้อ็อบเจกต์" ไม่ได้ "เปลี่ยนอ็อบเจกต์ใหม่ทั้งก้อน"
      const payload = { ...data };

      if (file) {
        const { imageUrl } = await ProductService.uploadImage(file, token);
        payload.imageUrl = imageUrl; // อันนี้คือการแก้ property ข้างใน const ยอมให้ทำได้ครับ
      }

      const updatedProduct = await ProductService.update(id, payload, token);

      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updatedProduct : p)),
        loading: false,
      }));
    } catch (error: unknown) {
      set({ loading: false });
      throw error;
    }
  },
  deleteProduct: async (id: string, token: string) => {
    try {
      set({ loading: true, error: null });

      // รับค่า Product ที่อัปเดตแล้วจาก Backend
      const updatedProduct = await ProductService.delete(id, token);

      set((state) => ({
        // ✅ แทนที่จะ filter ออก ให้ map เพื่อเปลี่ยนค่าใน List
        products: state.products.map((p) => (p.id === id ? updatedProduct : p)),
        loading: false,
      }));
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), loading: false });
    }
  },
}));
