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
    const response = await api.post("/api/user/order", orderData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
  getMyOrders: async (token: string): Promise<OrderData[]> => {
    const response = await api.get("/api/user/order/my", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  getOrderById: async (id: string, token: string): Promise<OrderData> => {
    const response = await api.get(`/api/user/order/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data; // Backend ต้องส่งข้อมูล Order กลับมา
  },
  // ดึงข้อมูลออเดอร์ทั้งหมด
  getAllOrders: async (token: string): Promise<OrderData[]> => {
    const response = await api.get("/api/admin/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },
  uploadOrderSlip: async (orderId: string, file: File, token: string) => {
    const formData = new FormData();
    formData.append("slip", file); // ชื่อ "slip" ต้องตรงกับ Backend

    const response = await api.patch(`/api/${orderId}/upload-slip`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
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
