"use client";
import { useEffect, useState } from "react";
import { Product } from "@/types";
import ProductCard from "./ProductCard";
import { BookOpen } from "lucide-react";

interface Props {
  product: Product;
}

export default function CompletaSerie({ product }: Props) {
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    // Estrae le prime 1-2 parole significative dal titolo (es. "Zagor", "Alan Ford", "Tex Willer")
    const words = product.title
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(w => w.length > 2);

    // Prende le prime 2 parole come keyword serie
    const keyword = words.slice(0, 2).join(" ");
    if (!keyword) return;

    fetch(`/api/products/list?q=${encodeURIComponent(keyword)}&category=${product.category}&page=1`)
      .then(r => r.json())
      .then(data => {
        const others = (data.products ?? []).filter((p: Product) => p.id !== product.id).slice(0, 4);
        setRelated(others);
      })
      .catch(() => {});
  }, [product]);

  if (related.length === 0) return null;

  // Estrai nome serie per il titolo
  const seriesName = product.title.split(/\s+/).slice(0, 2).join(" ");

  return (
    <section className="mt-12">
      <div className="flex items-center gap-2 mb-5">
        <BookOpen size={18} className="text-accent" />
        <h2 className="font-serif text-xl font-bold text-white">
          Altri <span className="text-accent">{seriesName}</span> disponibili
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {related.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
