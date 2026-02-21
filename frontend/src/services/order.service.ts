import { api } from "../lib/axios";
import type {
  CreateOrderDto,
  OrderData,
  OrderStatus,
} from "@/shared/types/order";

export const orderService = {
  createOrder: async (
    orderData: CreateOrderDto,
    token: string,
  ): Promise<OrderData> => {
    const response = await api.post("/api/user/order", orderData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  // ดึงข้อมูลออเดอร์ทั้งหมด
  getAllOrders: async (token: string): Promise<OrderData[]> => {
    const response = await api.get("/api/admin/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // อัปเดตสถานะออเดอร์
  updateStatus: async (
    orderId: string,
    newStatus: OrderStatus,
    token: string,
  ): Promise<OrderData> => {
    const response = await api.patch(
      `/api/admin/orders/${orderId}/status`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response.data;
  },
};
