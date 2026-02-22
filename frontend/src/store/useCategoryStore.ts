// src/store/categoryStore.ts
import type { CategoryStore } from "../../../shared/types/product";
import { create } from "zustand";
import { categoryService } from "../services/category.service";

export const useCategoryStore = create<CategoryStore>((set) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      // เรียกใช้ Service แทนการเขียน axios.get เอง
      const data = await categoryService.getAllCategories();
      set({ categories: data, loading: false });
    } catch (error: unknown) {
      set({
        loading: false,
      });
      console.log(error);
    }
  },
}));
