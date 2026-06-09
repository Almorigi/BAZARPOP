export const dynamic = "force-dynamic";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Star, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import NewsletterSection from "@/components/NewsletterSection";
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

async function getBundles() {
  const { data } = await supabase
    .from("bundles")
    .select("id, title, description, price, images, product_ids")
    .order("created_at", { ascending: false })
    .limit(3);
  return data ?? [];
}

async function getSpotlightProduct(): Promise<Product | null> {
  // Prende il prodotto in evidenza: featured=true se esiste, altrimenti il più recente disponibile con immagine
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("sold", false)
    .gt("stock", 0)
    .order("created_at", { ascending: false })
    .limit(20);

  if (!data || data.length === 0) return null;
  // Preferisci prodotti con immagini e descrizione
  const withImg = data.filter((p: Product) => p.images?.length > 0 && p.description);
  return withImg[0] ?? data[0];
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
    label: "Film DVD",
    sub: "Action · Classici · Serie TV",
    href: "/products?category=dvd",
    emoji: "🎬",
    gradient: "from-rose-500/10 to-red-600/5",
    border: "hover:border-rose-500/30",
    glow: "hover:shadow-[0_0_40px_rgba(244,63,94,0.1)]",
  },
  {
    label: "Oggetti Vari",
    sub: "Drone · Tech · Curiosità",
    href: "/products?category=oggetti",
    emoji: "✦",
    gradient: "from-emerald-500/10 to-teal-600/5",
    border: "hover:border-emerald-500/30",
    glow: "hover:shadow-[0_0_40px_rgba(16,185,129,0.1)]",
  },
];

export default async function HomePage() {
  const [products, spotlight, bundles] = await Promise.all([getFeaturedProducts(), getSpotlightProduct(), getBundles()]);

  return (
    <div className="overflow-hidden">

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col justify-center pt-20">

        {/* Video background — desktop 16:9, mobile 9:16 quando pronto */}
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover hidden sm:block"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_39wDkjQhEmTB70wanWcr2To23g3/hf_20260604_175320_1e7b8642-86b4-468c-904f-97f55cf170b0.mp4"
        />
        {/* Mobile: immagine statica atmosferica */}
        <div
          className="absolute inset-0 sm:hidden bg-cover bg-center"
          style={{ backgroundImage: "url('https://d8j0ntlcm91z4.cloudfront.net/user_39wDkjQhEmTB70wanWcr2To23g3/hf_20260604_181534_f692a8da-1e6b-470d-abbb-fd189385410e_min.webp')" }}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-[#080808]/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(249,115,22,0.08),transparent)]" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 text-xs font-medium text-accent tracking-widest uppercase mb-10 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            La collezione di un appassionato
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
              { n: "5",     label: "Categorie" },
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
                <div className="font-serif text-xl font-bold text-white">{cat.label}</div>
              </div>
              <div className="flex items-center gap-1 text-xs text-neutral-600 group-hover:text-accent transition-colors mt-auto">
                Scopri <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── BUNDLE ── */}
      {bundles.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-accent mb-3">Risparmia di più</p>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">Bundle & Lotti</h2>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {bundles.map((b) => (
              <a key={b.id} href={`/bundle/${b.id}`}
                className="group glass border border-border rounded-3xl overflow-hidden hover:border-accent/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
                <div className="relative aspect-video bg-surface-2">
                  {b.images?.[0]
                    ? <Image src={b.images[0]} alt={b.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 100vw, 33vw" />
                    : <div className="flex items-center justify-center h-full text-5xl">📦</div>
                  }
                  <div className="absolute top-3 left-3 bg-accent text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {b.product_ids?.length ?? 0} pezzi
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-serif text-lg font-bold text-white mb-1 line-clamp-1">{b.title}</h3>
                  {b.description && <p className="text-neutral-500 text-xs line-clamp-2 mb-3">{b.description}</p>}
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-2xl font-bold text-accent">€{(b.price / 100).toFixed(2)}</span>
                    <span className="text-xs text-neutral-500 group-hover:text-accent transition-colors flex items-center gap-1">
                      Vedi bundle <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ── SPOTLIGHT / PRODOTTO IN EVIDENZA ── */}
      {spotlight && (
        <section className="max-w-7xl mx-auto px-6 pb-24">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles size={14} className="text-accent" />
            <p className="text-xs tracking-[0.3em] uppercase text-accent">Prodotto in evidenza</p>
          </div>
          <Link href={`/products/${spotlight.id}`}
            className="group relative overflow-hidden rounded-3xl glass border border-border hover:border-accent/30 transition-all duration-300 flex flex-col md:flex-row glow-orange">
            {/* Image */}
            <div className="relative md:w-1/3 aspect-[3/2] md:aspect-auto bg-surface-2 flex-shrink-0">
              {spotlight.images[0]
                ? <Image src={spotlight.images[0]} alt={spotlight.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" sizes="(max-width:768px) 100vw, 33vw" />
                : <div className="flex items-center justify-center h-full text-6xl">📦</div>
              }
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0d0d0d] hidden md:block" />
            </div>
            {/* Content */}
            <div className="flex flex-col justify-center p-8 md:p-12 flex-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs bg-accent/20 border border-accent/30 text-accent px-3 py-1 rounded-full font-semibold tracking-wider uppercase">
                  ✦ In evidenza
                </span>
                {spotlight.avg_rating != null && spotlight.review_count != null && spotlight.review_count > 0 && (
                  <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
                    <Star size={10} fill="currentColor" />
                    {spotlight.avg_rating.toFixed(1)} ({spotlight.review_count})
                  </span>
                )}
              </div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3 leading-tight">
                {spotlight.title}
              </h2>
              {spotlight.description && (
                <p className="text-neutral-400 text-sm leading-relaxed mb-6 line-clamp-3">{spotlight.description}</p>
              )}
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-serif text-3xl font-bold text-accent">€{(spotlight.price / 100).toFixed(2)}</span>
                <span className="flex items-center gap-2 bg-accent text-white font-bold px-6 py-3 rounded-2xl text-sm group-hover:bg-orange-600 transition-colors">
                  Vedi il prodotto <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ── LATEST PRODUCTS ── */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-accent mb-3">In vetrina</p>
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

      {/* ── NEWSLETTER ── */}
      <NewsletterSection />
    </div>
  );
}
