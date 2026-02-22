import { create } from "zustand";
import { orderService } from "../services/order.service";
import type { CreateOrderDto, OrderState } from "@/shared/types/order";

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],
  loading: false,
  error: null,

  createOrder: async (orderData: CreateOrderDto, token: string) => {
    set({ loading: true, error: null });
    try {
      const newOrder = await orderService.createOrder(orderData, token);

      // เพิ่ม Order ใหม่ลงไปในลิสต์ (เผื่อใช้แสดงผลทันที)
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
    set({ loading: true, error: null }); // ใช้ loading เพื่อให้เป็นมาตรฐานเดียวกับ createOrder
    try {
      const updatedOrder = await orderService.uploadOrderSlip(
        orderId,
        file,
        token,
      );

      // อัปเดตข้อมูลในลิสต์ orders ทันที
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, ...updatedOrder } : order,
        ),
        loading: false,
      }));

      return true;
    } catch (err: unknown) {
      console.log(err);

      set({ loading: false });
      return false;
    }
  },
  ///-------------------------------admin---------------------------
  fetchOrders: async (token: string) => {
    set({ loading: true, error: null });
    try {
      const data = await orderService.getAllOrders(token);
      set({ orders: data, loading: false });
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
        set({
          loading: false,
        });
      }
    }
  },

  updateOrderStatus: async (orderId, newStatus, token) => {
    set({ loading: true });
    try {
      // 1. ส่งไปบอก Backend ให้เปลี่ยน (ยิงไปที่ /api/admin/orders/:id/status)
      await orderService.updateStatus(orderId, newStatus, token);

      // 2. ถ้า Backend ไม่ Error (ยิงผ่าน) ให้เปลี่ยนสถานะใน UI ทันที
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus } // 👈 ใช้ newStatus ตรงๆ เลย
            : order,
        ),
        loading: false,
      }));

      console.log(
        `✅ UI Updated: เปลี่ยน ID ${orderId.slice(-4)} เป็น ${newStatus}`,
      );
    } catch (err) {
      console.error("❌ Update failed:", err);
      set({ loading: false });
    }
  },
}));
