import type { UserData } from "./user.js";
import type { ProductData } from "./product.js";

export interface OrderData {
  id: string;
  userId: string;
  totalPrice: number;
  status: OrderStatus;
  paymentIntentId: string | null;
  slipUrl?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  // Relation data
  user?: UserData;
  items?: OrderItemData[];
}

export interface OrderItemData {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  // Relation data
  product?: ProductData;
  order?: OrderData; // ✅ แก้จาก OrderItemData เป็น OrderData
}
export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "CANCELLED";
export interface OrderState {
  orders: OrderData[];
  loading: boolean;
  error: string | null;
  fetchOrders: (token: string) => Promise<void>;
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
}
export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  phone: string;
  email: string;
}
export interface CreateOrderDto {
  items: OrderItem[];
  totalPrice: number; // แก้จาก totalAmount เป็น totalPrice
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}
export interface OrderStore {
  isUploading: boolean;
  error: string | null;
  uploadSlip: (orderId: string, file: File) => Promise<boolean>;
}
