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
    try {
      const updatedOrder = await orderService.updateStatus(
        orderId,
        newStatus,
        token,
      );

      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId
            ? { ...order, status: updatedOrder.status }
            : order,
        ),
      }));
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
        set({
          loading: false,
        });
      }
    }
  },
}));
