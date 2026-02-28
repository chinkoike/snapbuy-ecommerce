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
        products: data.products,
        totalPages: data.pagination.totalPages,
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
      const payload = { ...data };

      if (file) {
        const { imageUrl } = await ProductService.uploadImage(file, token);
        payload.imageUrl = imageUrl;
      } else if (data.imageUrl === "" || data.imageUrl === null) {
        payload.imageUrl = null;
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

      const updatedProduct = await ProductService.delete(id, token);

      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updatedProduct : p)),
        loading: false,
      }));
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), loading: false });
    }
  },
}));
