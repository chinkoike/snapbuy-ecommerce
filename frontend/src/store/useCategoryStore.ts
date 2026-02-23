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
  addCategory: async (name: string, token: string) => {
    set({ loading: true, error: null });
    try {
      const newCategory = await categoryService.createCategory(name, token);

      // เมื่อสร้างสำเร็จ ให้เอาข้อมูลใหม่ไป "ต่อท้าย" ใน list เดิมทันที
      set((state) => ({
        categories: [...state.categories, newCategory],
        loading: false,
      }));
    } catch (error: unknown) {
      console.log(error);

      set({
        loading: false,
      });
      throw error;
    }
  },
}));
