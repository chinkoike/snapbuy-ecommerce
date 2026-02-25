export interface RecentUser {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

export interface DashboardStats {
  sales: {
    total: number;
    label: string;
    icon: string;
  };
  inventory: {
    total: number;
    active: number;
    outOfStock: number;
    categories: number;
    label: string;
    icon: string;
  };
  users: {
    total: number;
    recent: RecentUser[];
    label: string;
    icon: string;
  };
}

export interface AdminStatsResponse {
  success: boolean;
  stats: DashboardStats;
}

export interface AdminState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: (token: string) => Promise<void>;
}
