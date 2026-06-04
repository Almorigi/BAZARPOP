import Link from "next/link";
import { ArrowRight, BookOpen, Gamepad2, Package, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";

async function getFeaturedProducts(): Promise<Product[]> {
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("sold", false)
    .order("created_at", { ascending: false })
    .limit(8);
  return data ?? [];
}

const categories = [
  { label: "Fumetti", href: "/products?category=fumetti", icon: "📚", color: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30" },
  { label: "Libri", href: "/products?category=libri", icon: "📖", color: "from-sky-500/20 to-blue-500/20 border-sky-500/30", IconComp: BookOpen },
  { label: "Videogiochi", href: "/products?category=videogiochi", icon: "🎮", color: "from-purple-500/20 to-pink-500/20 border-purple-500/30", IconComp: Gamepad2 },
  { label: "Oggetti Vari", href: "/products?category=oggetti", icon: "📦", color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30", IconComp: Package },
];

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface-800 border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-purple-500/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 py-24 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/30 rounded-full px-4 py-1.5 text-sm text-brand-500 font-medium mb-6">
            <Zap size={14} /> Nuovi arrivi ogni settimana
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Il tuo bazar<br />
            <span className="text-brand-500">digitale</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto mb-10">
            Fumetti, libri, videogiochi e oggetti unici. Tutto selezionato con cura, spedito velocemente.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/products" className="flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-3.5 rounded-xl transition-colors text-sm">
              Esplora tutto <ArrowRight size={16} />
            </Link>
            <Link href="/products?category=fumetti" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-sm">
              Vai ai fumetti
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-extrabold text-white mb-8">Categorie</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className={`group bg-gradient-to-br ${cat.color} border rounded-xl p-6 flex flex-col items-center gap-3 hover:scale-105 transition-transform`}
            >
              <span className="text-4xl">{cat.icon}</span>
              <span className="font-bold text-white text-sm">{cat.label}</span>
              <ArrowRight size={14} className="text-gray-400 group-hover:text-white transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* Latest products */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-extrabold text-white">Ultimi arrivi</h2>
          <Link href="/products" className="text-sm text-brand-500 hover:text-brand-600 flex items-center gap-1 font-medium">
            Vedi tutti <ArrowRight size={14} />
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="text-gray-500 text-center py-16">Nessun prodotto ancora disponibile.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
