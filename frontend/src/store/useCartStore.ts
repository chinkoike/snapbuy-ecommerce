// src/store/useCartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartState } from "../../../shared/types/cart.js";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      isDrawerOpen: false,
      toggleDrawer: () =>
        set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
      openDrawer: () => set({ isDrawerOpen: true }),
      closeDrawer: () => set({ isDrawerOpen: false }),
      addToCart: (product) => {
        const cart = get().cart;
        const item = cart.find((i) => i.id === product.id);
        if (item) {
          set({
            cart: cart.map((i) =>
              i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
            ),
          });
        } else {
          set({ cart: [...cart, { ...product, quantity: 1 }] });
        }
      },
      removeFromCart: (id) =>
        set({ cart: get().cart.filter((i) => i.id !== id) }),
      updateQuantity: (id, amount) => {
        const cart = get().cart;
        set({
          cart: cart.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.max(1, i.quantity + amount) }
              : i,
          ),
        });
      },

      clearCart: () => set({ cart: [] }),
      totalPrice: () =>
        get().cart.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        ),
    }),
    { name: "cart-storage" }, // เก็บไว้ใน LocalStorage อัตโนมัติ
  ),
);
