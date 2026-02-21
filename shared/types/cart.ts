import type { ProductData } from "./product.js";

export interface CartItem extends ProductData {
  quantity: number;
}

export interface CartState {
  cart: CartItem[];
  addToCart: (product: ProductData) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, amount: number) => void;
  clearCart: () => void;
  totalPrice: () => number;
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}
