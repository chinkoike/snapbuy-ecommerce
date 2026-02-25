import { api } from "../lib/axios";
import type { AdminStatsResponse } from "../../../shared/types/admin";

export const AdminService = {
  getStats: async (token: string): Promise<AdminStatsResponse> => {
    const res = await api.get<AdminStatsResponse>("/api/admin/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  },
};
