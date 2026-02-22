import { create } from "zustand";
import { orderService } from "../services/order.service";
// นำเข้า Type ที่เราตกลงกันไว้ (เปลี่ยน path ให้ตรงกับโปรเจกต์คุณ)
import type {
  OrderStore,
  OrderStatus,
  CreateOrderDto,
} from "@/shared/types/order";

// 1. เปลี่ยนจาก OrderState เป็น OrderStore ตาม Interface ใหม่
export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  loading: false,
  isUploading: false, // เพิ่มตัวแปรนี้ตาม Interface ใหม่
  error: null,

  // --- Client Side ---
  createOrder: async (orderData: CreateOrderDto, token: string) => {
    set({ loading: true, error: null });
    try {
      const newOrder = await orderService.createOrder(orderData, token);

      set((state) => ({
        orders: [newOrder, ...state.orders],
        loading: false,
      }));

      return newOrder;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to place order";
      set({ error: message, loading: false });
      return null;
    }
  },

  uploadSlip: async (
    orderId: string,
    file: File,
    token: string,
  ): Promise<boolean> => {
    // 2. ใช้ isUploading แทน loading ตามที่แยกไว้ใน Interface เพื่อไม่ให้ UI กระตุก
    set({ isUploading: true, error: null });
    try {
      const updatedOrder = await orderService.uploadOrderSlip(
        orderId,
        file,
        token,
      );

      set((state) => ({
        orders: state.orders.map((order) =>
          // รองรับทั้ง .id และ ._id (เผื่อกรณี mongo)
          order.id === orderId ? { ...order, ...updatedOrder } : order,
        ),
        isUploading: false,
      }));

      return true;
    } catch (err: unknown) {
      console.error("Upload slip error:", err);
      set({ isUploading: false, error: "Upload failed" });
      return false;
    }
  },

  // --- Admin Side ---
  fetchOrders: async (token: string) => {
    set({ loading: true, error: null });
    try {
      const data = await orderService.getAllOrders(token);
      set({ orders: data, loading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch orders";
      set({ error: message, loading: false });
    }
  },

  updateOrderStatus: async (
    orderId: string,
    newStatus: OrderStatus,
    token: string,
  ) => {
    set({ loading: true });
    try {
      await orderService.updateStatus(orderId, newStatus, token);

      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
        loading: false,
      }));

      console.log(`✅ UI Updated: ${orderId.slice(-4)} -> ${newStatus}`);
    } catch (err) {
      console.error("❌ Update failed:", err);
      set({ loading: false, error: "Update status failed" });
    }
  },
}));
