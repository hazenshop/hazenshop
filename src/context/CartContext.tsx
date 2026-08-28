"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { OrderItem, Product, ProductVariant } from "@/lib/types";

interface CartContextType {
  cart: OrderItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (
    product: Product,
    variant?: ProductVariant,
    quantity?: number,
    options?: { silent?: boolean }
  ) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hazen_cart");
      if (saved) {
        setCart(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load cart from storage", e);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("hazen_cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addToCart = (
    product: Product,
    variant?: ProductVariant,
    quantity = 1,
    options?: { silent?: boolean }
  ) => {
    setCart((prev) => {
      const effectivePrice = variant ? (variant.salePrice ?? variant.price) : (product.salePrice ?? product.price);
      const variantId = variant?.id;
      const variantName = variant?.name;

      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && item.variantId === variantId
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          total: newQty * effectivePrice,
        };
        return updated;
      }

      const newItem: OrderItem = {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug,
        productImage: (variant?.image || product.images[0]) || "/logo.jpg",
        variantId,
        variantName,
        quantity,
        price: effectivePrice,
        total: quantity * effectivePrice,
      };

      return [...prev, newItem];
    });

    // Only open the cart drawer if NOT silent
    if (!options?.silent) {
      setIsOpen(true);
    }
  };

  const removeFromCart = (productId: string, variantId?: string) => {
    setCart((prev) =>
      prev.filter((item) => !(item.productId === productId && item.variantId === variantId))
    );
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId && item.variantId === variantId) {
          return {
            ...item,
            quantity,
            total: quantity * item.price,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        openCart,
        closeCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
