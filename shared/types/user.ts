import type { OrderData } from "./order.js";

export interface UserData {
  id: string;
  auth0Id: string;
  email: string;
  role: "ADMIN" | "USER";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  // --- ข้อมูลที่เพิ่มเข้ามาจากการ Join หรือ Aggregate ---
  orderCount?: number; // จำนวนออเดอร์ทั้งหมด
  totalSpent?: number; // ยอดเงินรวมที่จ่ายไปแล้ว
  orders?: OrderData[]; // รายการออเดอร์ (ถ้ามีการเรียกดู Details)
}

// สำหรับหน้า List ของ Admin (Zustand Store)
export interface UserState {
  user: UserData | null;
  users: UserData[];
  loading: boolean;
  error: string | null;

  setUser: (user: UserData) => void;
  clearUser: () => void;
  fetchUsers: (token: string) => Promise<void>;
  toggleUserStatus: (id: string, token: string) => Promise<void>;
}
export interface ExtendedUserState {
  user: UserData | null; // ข้อมูล User ที่ Login อยู่
  users: UserData[]; // รายชื่อ User ทั้งหมดสำหรับ Admin
  loading: boolean;
  error: string | null;

  setUser: (user: UserData) => void;
  clearUser: () => void;
  fetchUsers: (token: string) => Promise<void>;
  toggleUserStatus: (id: string, token: string) => Promise<void>;
}
