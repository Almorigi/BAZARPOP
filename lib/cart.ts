"use client";
import { CartItem, Product } from "@/types";

const CART_KEY = "bazarpop_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function addToCart(product: Product) {
  const cart = getCart();
  const existing = cart.find((i) => i.product.id === product.id);
  if (existing) {
    existing.quantity = Math.min(existing.quantity + 1, product.stock);
  } else {
    cart.push({ product, quantity: 1 });
  }
  saveCart(cart);
  window.dispatchEvent(new Event("cart-updated"));
}

export function removeFromCart(productId: string) {
  const cart = getCart().filter((i) => i.product.id !== productId);
  saveCart(cart);
  window.dispatchEvent(new Event("cart-updated"));
}

export function updateQuantity(productId: string, quantity: number) {
  const cart = getCart().map((i) =>
    i.product.id === productId ? { ...i, quantity } : i
  );
  saveCart(cart.filter((i) => i.quantity > 0));
  window.dispatchEvent(new Event("cart-updated"));
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event("cart-updated"));
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
}
