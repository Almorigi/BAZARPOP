"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { Product } from "@/types";

const KEY = "soffitta_recently_viewed";
const MAX = 6;

export function trackProductView(product: Product) {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(KEY);
  const list: Product[] = raw ? JSON.parse(raw) : [];
  const filtered = list.filter(p => p.id !== product.id);
  localStorage.setItem(KEY, JSON.stringify([product, ...filtered].slice(0, MAX)));
}

export default function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    const list: Product[] = raw ? JSON.parse(raw) : [];
    setProducts(list.filter(p => p.id !== excludeId).slice(0, 4));
  }, [excludeId]);

  if (products.length === 0) return null;

  return (
    <div className="mt-12 border-t border-white/5 pt-10">
      <div className="flex items-center gap-2 mb-6">
        <Clock size={16} className="text-accent" />
        <h2 className="font-serif text-xl font-bold text-white">Visti di recente</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {products.map(p => (
          <Link key={p.id} href={`/products/${p.id}`}
            className="group glass border border-border rounded-2xl overflow-hidden hover:border-accent/30 transition-all">
            <div className="relative aspect-[3/4] bg-surface-2">
              {p.images[0]
                ? <Image src={p.images[0]} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 50vw, 25vw" />
                : <div className="flex items-center justify-center h-full text-3xl">📦</div>
              }
            </div>
            <div className="p-3">
              <p className="text-white text-xs font-medium truncate">{p.title}</p>
              <p className="text-accent font-bold text-sm mt-1">€{(p.price / 100).toFixed(2)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
