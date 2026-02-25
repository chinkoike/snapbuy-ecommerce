import { api } from "../lib/axios";

export const UserService = {
  getUsers: async (token: string) => {
    const res = await api.get("/api/admin/user", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  toggleStatus: async (id: string, token: string) => {
    const res = await api.patch(
      `/api/admin/user/${id}`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return res.data;
  },
};
