import { create } from "zustand";
import type { ExtendedUserState } from "../../../shared/types/user.js";
import { UserService } from "../services/user.service";

export const useUserStore = create<ExtendedUserState>((set) => ({
  user: null,
  users: [],
  loading: false,
  error: null,

  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),

  fetchUsers: async (token: string) => {
    set({ loading: true, error: null });
    try {
      const data = await UserService.getUsers(token);
      set({ users: data, loading: false });
    } catch (error) {
      console.log(error);
      set({ error: "Failed to load users", loading: false });
    }
  },

  toggleUserStatus: async (id: string, token: string) => {
    set({ error: null });
    try {
      await UserService.toggleStatus(id, token);

      // ✅ อัปเดต State ในเครื่องทันทีเพื่อให้ UI เปลี่ยนสี/สถานะ โดยไม่ต้องโหลดใหม่
      set((state) => ({
        users: state.users.map((u) =>
          u.id === id ? { ...u, isActive: !u.isActive } : u,
        ),
      }));
    } catch (err) {
      set({ error: "Could not update user status" });
      throw err; // โยน error กลับไปเพื่อให้หน้า UI รู้ว่าไม่ต้องหยุด loading
    }
  },
}));
