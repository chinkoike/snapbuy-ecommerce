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
  token?: string;

  orderCount?: number;
  totalSpent?: number;
  orders?: OrderData[];
}

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
  user: UserData | null;
  users: UserData[];
  loading: boolean;
  error: string | null;

  setUser: (user: UserData) => void;
  clearUser: () => void;
  fetchUsers: (token: string) => Promise<void>;
  toggleUserStatus: (id: string, token: string) => Promise<void>;
}

export interface UserProfileCardProps {
  userFromDb: {
    role?: string;
    email?: string;
  } | null;
  isLoading?: boolean;
}
