"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { addToCart } from "@/lib/cart";
import { Product } from "@/types";
import { ShoppingCart, ArrowLeft, CheckCircle, X, ChevronLeft, ChevronRight, Share2, ChevronRight as Chevron, Bell } from "lucide-react";
import WishlistButton from "@/components/WishlistButton";
import ProductReviews from "@/components/ProductReviews";
import Link from "next/link";
import { clsx } from "clsx";

function ShareButtons({ product }: { product: Product }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = `${product.title} — €${(product.price / 100).toFixed(2)}`;

  function copyLink() {
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  return (
    <div className="flex items-center gap-2 pt-1">
      <span className="text-xs text-neutral-600 flex items-center gap-1"><Share2 size={11} /> Condividi:</span>
      {/* WhatsApp */}
      <a href={`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`} target="_blank" rel="noopener noreferrer"
        className="text-xs bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] px-2.5 py-1 rounded-lg border border-[#25D366]/20 transition-colors">
        WhatsApp
      </a>
      {/* Facebook */}
      <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer"
        className="text-xs bg-[#1877F2]/10 hover:bg-[#1877F2]/20 text-[#1877F2] px-2.5 py-1 rounded-lg border border-[#1877F2]/20 transition-colors">
        Facebook
      </a>
      {/* Copia link */}
      <button onClick={copyLink}
        className="text-xs bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 transition-colors">
        {copied ? "✓ Copiato!" : "Copia link"}
      </button>
    </div>
  );
}

const conditionConfig: Record<string, { label: string; cls: string }> = {
  nuovo:    { label: "Nuovo",    cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  ottimo:   { label: "Ottimo",   cls: "text-sky-400 bg-sky-400/10 border-sky-400/20" },
  buono:    { label: "Buono",    cls: "text-amber-400 bg-amber-400/10 border-amber-400/20" },
  discreto: { label: "Discreto", cls: "text-neutral-400 bg-white/5 border-white/10" },
};

const categoryLabel: Record<string, string> = {
  fumetti: "Fumetto", libri: "Libro", videogiochi: "Videogioco", dvd: "Film DVD", oggetti: "Oggetto",
};
const categoryHref: Record<string, string> = {
  fumetti: "/products?category=fumetti", libri: "/products?category=libri",
  videogiochi: "/products?category=videogiochi", dvd: "/products?category=dvd", oggetti: "/products?category=oggetti",
};

function NotifyMe({ productId }: { productId: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/notify-me", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, productId }),
    });
    setLoading(false); setSent(true);
  }

  if (sent) return <p className="text-emerald-400 text-sm flex items-center gap-2"><CheckCircle size={14} /> Ti avviseremo quando disponibile!</p>;

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
        placeholder="La tua email"
        className="flex-1 bg-surface-3 border border-border rounded-xl px-3 py-2 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-accent/40"
        style={{ colorScheme: "dark" }} />
      <button type="submit" disabled={loading}
        className="flex items-center gap-1.5 bg-[#1e1e1e] hover:bg-[#2a2a2a] border border-white/10 text-neutral-300 text-xs font-semibold px-3 py-2 rounded-xl transition-colors disabled:opacity-50">
        {loading ? "..." : <><Bell size={12} /> Avvisami</>}
      </button>
    </form>
  );
}

export default function ProductDetail({ product, related }: { product: Product; related: Product[] }) {
  const [activeImg, setActiveImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const price = (product.price / 100).toFixed(2);
  const cond = conditionConfig[product.condition];

  // Chiudi lightbox con Escape, naviga con frecce
  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") setActiveImg(i => (i + 1) % product.images.length);
      if (e.key === "ArrowLeft") setActiveImg(i => (i - 1 + product.images.length) % product.images.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, product.images.length]);

  function handleAdd() {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <>
    {/* Lightbox */}
    {lightbox && product.images.length > 0 && (
      <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightbox(false)}>
        <button className="absolute top-4 right-4 text-white/70 hover:text-white p-2" onClick={() => setLightbox(false)}>
          <X size={28} />
        </button>
        {product.images.length > 1 && (
          <>
            <button className="absolute left-4 text-white/70 hover:text-white p-2 bg-white/10 rounded-full"
              onClick={e => { e.stopPropagation(); setActiveImg(i => (i - 1 + product.images.length) % product.images.length); }}>
              <ChevronLeft size={28} />
            </button>
            <button className="absolute right-4 text-white/70 hover:text-white p-2 bg-white/10 rounded-full"
              onClick={e => { e.stopPropagation(); setActiveImg(i => (i + 1) % product.images.length); }}>
              <ChevronRight size={28} />
            </button>
          </>
        )}
        <div className="relative w-full max-w-2xl max-h-[90vh] aspect-[3/4] mx-8" onClick={e => e.stopPropagation()}>
          <Image src={product.images[activeImg]} alt={product.title} fill className="object-contain" sizes="90vw" />
        </div>
        {product.images.length > 1 && (
          <div className="absolute bottom-4 flex gap-2">
            {product.images.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setActiveImg(i); }}
                className={clsx("w-2 h-2 rounded-full transition-colors", i === activeImg ? "bg-accent" : "bg-white/30")} />
            ))}
          </div>
        )}
      </div>
    )}
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-neutral-600 mb-8 flex-wrap">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <Chevron size={12} />
        <Link href="/products" className="hover:text-white transition-colors">Collezione</Link>
        <Chevron size={12} />
        <Link href={categoryHref[product.category] ?? "/products"} className="hover:text-white transition-colors capitalize">
          {categoryLabel[product.category] ?? product.category}
        </Link>
        <Chevron size={12} />
        <span className="text-neutral-400 truncate max-w-[200px]">{product.title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-14">
        {/* Images */}
        <div className="flex flex-col gap-3">
          <div
            className={clsx("relative aspect-[3/4] bg-surface-2 rounded-3xl overflow-hidden border border-border", product.images.length > 0 && !product.sold && "cursor-zoom-in")}
            onClick={() => product.images.length > 0 && !product.sold && setLightbox(true)}
          >
            {product.images.length > 0
              ? <Image src={product.images[activeImg]} alt={product.title} fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 50vw" />
              : <div className="flex items-center justify-center h-full text-neutral-700 text-7xl">📦</div>
            }
            {product.sold && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <span className="font-serif text-white text-2xl font-bold tracking-[0.15em] rotate-[-20deg] border border-white/60 px-6 py-2">VENDUTO</span>
              </div>
            )}
            {product.images.length > 0 && !product.sold && (
              <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100">
                🔍 Ingrandisci
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)}
                  className={clsx("relative flex-shrink-0 w-16 h-20 rounded-xl overflow-hidden border-2 transition-colors", activeImg === i ? "border-accent" : "border-transparent opacity-50 hover:opacity-75")}>
                  <Image src={img} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2">
            <span className="text-xs bg-surface-3 text-neutral-400 px-3 py-1 rounded-full border border-border">
              {categoryLabel[product.category] ?? product.category}
            </span>
            <span className={clsx("text-xs font-medium px-3 py-1 rounded-full border", cond.cls)}>
              {cond.label}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white leading-tight">{product.title}</h1>
            <WishlistButton productId={product.id} size="lg" />
          </div>
          <div className="font-serif text-4xl font-bold text-accent">€{price}</div>
          {product.description && (
            <p className="text-neutral-400 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
          )}
          <p className="text-sm text-neutral-600">
            {product.stock > 1 ? `${product.stock} disponibili` : product.stock === 1 ? "⚡ Ultimo disponibile!" : "Esaurito"}
          </p>
          <ShareButtons product={product} />

          {!product.sold && product.stock > 0 ? (
            <button onClick={handleAdd}
              className={clsx("flex items-center justify-center gap-2 w-full font-bold py-4 rounded-2xl transition-all text-sm mt-2",
                added ? "bg-emerald-500 text-white" : "bg-accent hover:bg-orange-600 text-white shadow-[0_0_30px_rgba(249,115,22,0.25)]")}>
              {added ? <><CheckCircle size={18} /> Aggiunto!</> : <><ShoppingCart size={18} /> Aggiungi al carrello</>}
            </button>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              <div className="w-full py-4 rounded-2xl bg-surface-3 text-neutral-600 text-center font-semibold text-sm">Non disponibile</div>
              <div>
                <p className="text-xs text-neutral-600 mb-2 flex items-center gap-1"><Bell size={11} /> Vuoi essere avvisato se torna disponibile?</p>
                <NotifyMe productId={product.id} />
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Recensioni */}
      <ProductReviews productId={product.id} />

      {/* Prodotti correlati */}
      {related.length > 0 && (
        <div className="mt-20">
          <p className="text-xs tracking-[0.3em] uppercase text-accent mb-3">Stessa categoria</p>
          <h2 className="font-serif text-2xl font-bold text-white mb-8">Potrebbero interessarti</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((r) => (
              <Link key={r.id} href={`/products/${r.id}`}
                className="group glass border border-border rounded-2xl overflow-hidden hover:border-accent/30 transition-all">
                <div className="relative aspect-[3/4] bg-surface-2">
                  {r.images[0]
                    ? <Image src={r.images[0]} alt={r.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 50vw, 25vw" />
                    : <div className="flex items-center justify-center h-full text-4xl">📦</div>
                  }
                </div>
                <div className="p-3">
                  <p className="text-white text-sm font-medium truncate">{r.title}</p>
                  <p className="text-accent font-bold text-sm mt-1">€{(r.price / 100).toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
