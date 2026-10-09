"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/types";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  size: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  addItem: (product: Product, size: number, quantity?: number) => void;
  removeItem: (productId: string, size: number) => void;
  updateQuantity: (productId: string, size: number, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      addItem: (product, size, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.productId === product._id && item.size === size);

          if (existing) {
            return {
              isOpen: true,
              items: state.items.map((item) =>
                item.productId === product._id && item.size === size
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            };
          }

          return {
            isOpen: true,
            items: [
              ...state.items,
              {
                productId: product._id,
                slug: product.slug,
                name: product.name,
                image: product.images[0],
                price: product.price,
                size,
                quantity
              }
            ]
          };
        }),
      removeItem: (productId, size) =>
        set((state) => ({ items: state.items.filter((item) => item.productId !== productId || item.size !== size) })),
      updateQuantity: (productId, size, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.size === size ? { ...item, quantity: Math.max(1, quantity) } : item
          )
        })),
      clear: () => set({ items: [] })
    }),
    { name: "tt-sneaker-cart" }
  )
);
