import { create } from "zustand";
import { orderService } from "../services/order.service";
import type {
  OrderStore,
  OrderStatus,
  CreateOrderDto,
} from "../../../shared/types/order";

export const useOrderStore = create<OrderStore>((set) => ({
  orders: [],
  loading: false,
  isUploading: false,
  error: null,
  fetchOrderById: async (id: string, token: string) => {
    set({ loading: true, error: null });
    try {
      const data = await orderService.getOrderById(id, token);

      set((state) => ({
        orders: state.orders.some((o) => o.id === data.id)
          ? state.orders.map((o) => (o.id === data.id ? data : o))
          : [...state.orders, data],
        loading: false,
      }));

      return data;
    } catch (err: unknown) {
      console.log(err);

      set({ loading: false });
      return null;
    }
  },
  fetchOrdersUser: async (token: string) => {
    set({ loading: true });
    try {
      const data = await orderService.getMyOrders(token);
      set({ orders: data, loading: false });
    } catch (err: unknown) {
      console.log(err);

      set({ loading: false });
      return;
    }
  },
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
    set({ isUploading: true, error: null });
    try {
      const updatedOrder = await orderService.uploadOrderSlip(
        orderId,
        file,
        token,
      );

      set((state) => ({
        orders: state.orders.map((order) =>
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
  cancelOrder: async (orderId: string, token: string) => {
    set({ loading: true });
    try {
      await orderService.cancelOrder(orderId, token);

      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, status: "CANCELLED" } : order,
        ),
        loading: false,
      }));

      return { success: true };
    } catch (error) {
      set({ loading: false });
      throw error;
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
