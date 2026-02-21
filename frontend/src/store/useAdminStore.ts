import { create } from "zustand";
import { AdminService } from "../services/admin.service";
import type { AdminState } from "@/shared/types/admin";

export const useAdminStore = create<AdminState>((set) => ({
  stats: null,
  loading: false,
  error: null,

  fetchStats: async (token: string) => {
    try {
      set({ loading: true, error: null });
      const data = await AdminService.getStats(token);
      if (data.success) {
        set({ stats: data.stats, loading: false });
      }
    } catch (err: unknown) {
      set({
        loading: false,
      });
      console.log(err);
    }
  },
}));
