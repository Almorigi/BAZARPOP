import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
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
  {
    label: "Fumetti",
    sub: "Marvel · DC · Manga · Indie",
    href: "/products?category=fumetti",
    emoji: "📚",
    gradient: "from-amber-500/10 to-orange-600/5",
    border: "hover:border-amber-500/30",
    glow: "hover:shadow-[0_0_40px_rgba(245,158,11,0.1)]",
  },
  {
    label: "Libri",
    sub: "Romanzi · Saggi · Narrativa",
    href: "/products?category=libri",
    emoji: "📖",
    gradient: "from-sky-500/10 to-blue-600/5",
    border: "hover:border-sky-500/30",
    glow: "hover:shadow-[0_0_40px_rgba(14,165,233,0.1)]",
  },
  {
    label: "Videogiochi",
    sub: "Retro · Console · PC",
    href: "/products?category=videogiochi",
    emoji: "🎮",
    gradient: "from-violet-500/10 to-purple-600/5",
    border: "hover:border-violet-500/30",
    glow: "hover:shadow-[0_0_40px_rgba(139,92,246,0.1)]",
  },
  {
    label: "Oggetti Rari",
    sub: "Drone · Tech · Curiosità",
    href: "/products?category=oggetti",
    emoji: "✦",
    gradient: "from-emerald-500/10 to-teal-600/5",
    border: "hover:border-emerald-500/30",
    glow: "hover:shadow-[0_0_40px_rgba(16,185,129,0.1)]",
  },
];

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <div className="overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col justify-center pt-20">

        {/* Background layers */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(249,115,22,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(251,191,36,0.04),transparent)]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

        {/* Grid lines decorative */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 text-xs font-medium text-accent tracking-widest uppercase mb-10 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Nuovi pezzi ogni settimana
          </div>

          {/* Headline */}
          <h1 className="font-serif text-6xl md:text-8xl xl:text-[104px] font-bold text-white leading-[0.95] tracking-tight mb-8 animate-fade-up">
            Ogni oggetto<br />
            <em className="gradient-text not-italic">racconta</em><br />
            una storia
          </h1>

          <p className="text-neutral-400 text-lg md:text-xl max-w-lg mx-auto mb-12 leading-relaxed animate-fade-up" style={{ animationDelay: "0.1s", opacity: 0 }}>
            Fumetti, libri, videogiochi e oggetti unici.<br />
            Selezionati con cura da un collezionista appassionato.
          </p>

          <div className="flex flex-wrap gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
            <Link
              href="/products"
              className="group flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 text-sm tracking-wide shadow-[0_0_30px_rgba(249,115,22,0.3)] hover:shadow-[0_0_50px_rgba(249,115,22,0.5)]"
            >
              Esplora la collezione
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/products?category=fumetti"
              className="flex items-center gap-2 glass hover:bg-white/5 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 text-sm tracking-wide"
            >
              Vai ai fumetti
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-12 mt-20 animate-fade-up" style={{ animationDelay: "0.3s", opacity: 0 }}>
            {[
              { n: "1000+", label: "Pezzi disponibili" },
              { n: "4",     label: "Categorie" },
              { n: "100%",  label: "Selezionato a mano" },
            ].map(({ n, label }) => (
              <div key={label} className="text-center">
                <div className="font-serif text-3xl font-bold gradient-text mb-1">{n}</div>
                <div className="text-xs text-neutral-500 tracking-widest uppercase">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: "1s", opacity: 0 }}>
          <div className="w-px h-12 bg-gradient-to-b from-accent/50 to-transparent" />
          <span className="text-[10px] tracking-[0.3em] uppercase text-neutral-600">Scorri</span>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-accent mb-3">Esplora per categoria</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">Cosa cerchi?</h2>
          </div>
          <Link href="/products" className="hidden md:flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors group">
            Tutto il catalogo
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className={`group relative glass bg-gradient-to-br ${cat.gradient} ${cat.border} ${cat.glow} rounded-3xl p-6 md:p-8 flex flex-col gap-4 transition-all duration-300 card-lift overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
              <span className="text-4xl">{cat.emoji}</span>
              <div>
                <div className="font-serif text-xl font-bold text-white mb-1">{cat.label}</div>
                <div className="text-xs text-neutral-500 leading-relaxed">{cat.sub}</div>
              </div>
              <div className="flex items-center gap-1 text-xs text-neutral-600 group-hover:text-accent transition-colors mt-auto">
                Scopri <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── LATEST PRODUCTS ── */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-accent mb-3">Appena arrivati</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">Ultimi pezzi</h2>
          </div>
          <Link href="/products" className="hidden md:flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors group">
            Vedi tutti
            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-neutral-600 text-lg">Nessun prodotto ancora disponibile.</p>
            <p className="text-neutral-700 text-sm mt-2">Torna presto — nuovi pezzi in arrivo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        <div className="mt-10 md:hidden text-center">
          <Link href="/products" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors">
            Vedi tutta la collezione <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* ── BANNER ── */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent/20 via-orange-600/10 to-transparent border border-accent/20 p-12 md:p-16 text-center glow-orange">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(249,115,22,0.1),transparent)] pointer-events-none" />
          <p className="text-xs tracking-[0.3em] uppercase text-accent mb-4">La collezione ti aspetta</p>
          <h2 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6">
            Trova il tuo<br />
            <em className="gradient-text not-italic">tesoro nascosto</em>
          </h2>
          <p className="text-neutral-400 max-w-md mx-auto mb-10 leading-relaxed">
            Ogni pezzo è stato selezionato e curato personalmente. Spedizione veloce in tutta Italia.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-white text-black font-bold px-10 py-4 rounded-2xl hover:bg-neutral-100 transition-colors text-sm tracking-wide"
          >
            Esplora ora <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
