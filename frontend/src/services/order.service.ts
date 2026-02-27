import { api } from "../lib/axios";
import type {
  CreateOrderDto,
  OrderData,
  OrderStatus,
} from "../../../shared/types/order";

export const orderService = {
  createOrder: async (
    orderData: CreateOrderDto,
    token: string,
  ): Promise<OrderData> => {
    const res = await api.post("/api/user/order", orderData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data.data;
  },
  getMyOrders: async (token: string): Promise<OrderData[]> => {
    const res = await api.get("/api/user/order/my", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return Array.isArray(res.data.data) ? res.data.data : [];
  },
  getOrderById: async (id: string, token: string): Promise<OrderData> => {
    const res = await api.get(`/api/user/order/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
  },

  uploadOrderSlip: async (orderId: string, file: File, token: string) => {
    const formData = new FormData();
    formData.append("slip", file);

    const res = await api.patch(`/api/user/${orderId}/upload-slip`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.data;
  },

  cancelOrder: async (orderId: string, token: string) => {
    const res = await api.patch(
      `/api/user/order/${orderId}/cancel`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return res.data.data;
  },
  getAllOrders: async (token: string): Promise<OrderData[]> => {
    const res = await api.get("/api/admin/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return Array.isArray(res.data.data) ? res.data.data : [];
  },

  updateStatus: async (
    orderId: string,
    newStatus: OrderStatus,
    token: string,
  ): Promise<OrderData> => {
    const res = await api.patch(
      `/api/admin/orders/${orderId}/status`,
      { status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return res.data.data;
  },
};
