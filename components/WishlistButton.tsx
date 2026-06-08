"use client";
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { clsx } from "clsx";

const KEY = "soffitta_wishlist";

function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
}

function toggleWishlist(id: string): boolean {
  const list = getWishlist();
  const idx = list.indexOf(id);
  if (idx === -1) { list.push(id); localStorage.setItem(KEY, JSON.stringify(list)); return true; }
  else { list.splice(idx, 1); localStorage.setItem(KEY, JSON.stringify(list)); return false; }
}

export function useWishlistCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const update = () => setCount(getWishlist().length);
    update();
    window.addEventListener("wishlist-updated", update);
    return () => window.removeEventListener("wishlist-updated", update);
  }, []);
  return count;
}

export default function WishlistButton({ productId, size = "sm" }: { productId: string; size?: "sm" | "lg" }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(getWishlist().includes(productId));
  }, [productId]);

  function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggleWishlist(productId);
    setSaved(nowSaved);
    window.dispatchEvent(new Event("wishlist-updated"));
  }

  return (
    <button
      onClick={handleToggle}
      aria-label={saved ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
      className={clsx(
        "flex items-center justify-center rounded-full border transition-all",
        size === "lg" ? "w-10 h-10" : "w-8 h-8",
        saved
          ? "bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25"
          : "bg-white/5 border-white/10 text-neutral-500 hover:text-red-400 hover:border-red-400/30"
      )}
    >
      <Heart size={size === "lg" ? 18 : 14} className={saved ? "fill-red-400" : ""} />
    </button>
  );
}
