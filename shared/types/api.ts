import type { OrderData, OrderItemData } from "./order.js";
import type { CategoryData, ProductData } from "./product.js";

export interface ProductListResponse {
  products: Array<
    Omit<ProductData, "deletedAt"> & {
      category: CategoryData;
    }
  >;
  pagination: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}
export interface ProductDetailResponse extends Omit<ProductData, "deletedAt"> {
  category: CategoryData;
}
export interface OrderListResponse {
  orders: Array<
    OrderData & {
      items: Array<
        OrderItemData & {
          product: ProductData;
        }
      >;
    }
  >;
}
export interface AdminProductResponse extends ProductData {
  category: CategoryData;
}
