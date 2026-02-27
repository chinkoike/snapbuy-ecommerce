import type { UserData } from "./user.js";
import type { ProductData } from "./product.js";

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
  priceAtPurchase: number;
  product?: ProductData;
  order?: OrderData;
}

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
    price: number;
  }>;
  totalPrice: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
}

export interface OrderStore {
  orders: OrderData[];
  loading: boolean;
  isUploading: boolean;
  error: string | null;

  fetchOrders: (token: string) => Promise<void>;
  fetchOrderById: (id: string, token: string) => Promise<OrderData | null>;
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
