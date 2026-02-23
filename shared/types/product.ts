export interface CategoryData {
  id: string;
  name: string;
  createdAt?: Date; // ใส่ ? เพื่อบอกว่าเป็นตัวเลือก จะมีหรือไม่มีก็ได้
  updatedAt?: Date; // ใส่ ?
}
export interface FilterSidebarProps {
  categories: CategoryData[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}
export interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;

  isActive: boolean;
  deletedAt: Date | null;

  categoryId: string;
  createdAt: Date;
  updatedAt: Date;

  category?: CategoryData;
}
export type CreateProductInput = {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  categoryId: string;
};
export type UpdateProductInput = {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  imageUrl?: string | null;
  categoryId?: string;
  isActive?: boolean; // เผื่อ admin restore
};
export interface ProductState {
  products: ProductData[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  fetchProducts: (
    categoryId?: string | null,
    page?: number,
    search?: string,
  ) => Promise<void>;
  createProduct: (data: CreateProductInput, token: string) => Promise<void>;
  updateProduct: (
    id: string,
    data: UpdateProductInput,
    token: string,
  ) => Promise<void>;
  deleteProduct: (id: string, token: string) => Promise<void>;
}
export interface ProductFormProps {
  initialData?: ProductData | null;
  onSuccess: () => void;
}

interface Category {
  id: string;
  name: string;
}

export interface CategoryStore {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
}
// src/shared/types/product.ts

export interface ProductCardProps {
  product: ProductData; // ✨ ใช้ Type ใหญ่ไปเลย เพื่อให้ส่งต่อเข้า Store ได้ครบถ้วน
}
export interface GetProductsResponse {
  products: ProductData[];
  totalPages: number;
  totalCount: number;
}
