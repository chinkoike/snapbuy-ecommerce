import type { UserData } from "./user.js";
import type { ProductData } from "./product.js";

// --- 1. Core Data Models (ข้อมูลที่มาจาก Backend) ---
export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "CANCELLED";

export interface OrderData {
  id: string;
  userId: string;
  totalPrice: number;
  status: OrderStatus;
  paymentIntentId: string | null;
  slipUrl?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  user?: UserData;
  items?: OrderItemData[];
}

export interface OrderItemData {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number; // ราคาที่จ่ายจริง ณ ตอนนั้น
  product?: ProductData;
  order?: OrderData;
}

// --- 2. DTOs (ข้อมูลที่ใช้สำหรับส่งไป Create ออเดอร์) ---
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  email: string;
}

export interface CreateOrderDto {
  items: Array<{
    productId: string;
    quantity: number;
    price: number; // ราคาที่ส่งไปบันทึก
  }>;
  totalPrice: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}

// --- 3. Store Interface (รวม OrderState และ OrderStore เข้าด้วยกัน) ---
export interface OrderStore {
  orders: OrderData[];
  loading: boolean;
  isUploading: boolean; // แยก loading ปกติกับตอนอัปโหลดไฟล์
  error: string | null;

  fetchOrders: (token: string) => Promise<void>;
  fetchOrdersUser: (token: string) => Promise<void>;
  updateOrderStatus: (
    orderId: string,
    newStatus: OrderStatus,
    token: string,
  ) => Promise<void>;
  createOrder: (
    orderData: CreateOrderDto,
    token: string,
  ) => Promise<OrderData | null>;
  uploadSlip: (orderId: string, file: File, token: string) => Promise<boolean>;
  cancelOrder: (
    orderId: string,
    token: string,
  ) => Promise<{ success: boolean }>;
}
export interface OrderListProps {
  myOrders: OrderData[];
  isLoading: boolean;
  onSelectOrder: (order: OrderData) => void;
}
export interface OrderDetailModalProps {
  order: OrderData | null;
  onClose: () => void;
}
