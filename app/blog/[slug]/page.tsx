import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { posts, getPost } from "../posts";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Clock, ArrowRight } from "lucide-react";

interface Props { params: Promise<{ slug: string }> }

type ItemRow = { id: string; title: string; price: number; images: string[] | null };
type RelatedItem = { id: string; title: string; price: number; image?: string; href: string; isBundle: boolean };

export const revalidate = 3600;

const BASE_URL = "https://www.lasoffittadelcollezionista.it";

// Collega ogni articolo ai prodotti correlati del catalogo
const PRODUCT_LINKS: Record<string, { search?: string; category: string; label: string }> = {
  "tex-willer-guida-collezionista":        { search: "Tex",      category: "fumetti", label: "fumetti di Tex" },
  "zagor-lo-spirito-con-la-scure":         { search: "Zagor",    category: "fumetti", label: "fumetti di Zagor" },
  "dampyr-il-figlio-del-vampiro":          { search: "Dampyr",   category: "fumetti", label: "fumetti di Dampyr" },
  "come-conservare-fumetti-collezione":    { category: "fumetti", label: "fumetti in catalogo" },
  "fumetti-bonelli-rari-anni-70":          { category: "fumetti", label: "fumetti in catalogo" },
  "cassidy-serie-noir-italiana":           { search: "Cassidy",  category: "fumetti", label: "numeri di Cassidy" },
  "originale-o-ristampa-come-riconoscerlo":{ category: "fumetti", label: "fumetti in catalogo" },
  "dvd-da-collezione-quali-valgono-di-piu":{ category: "dvd",     label: "DVD in catalogo" },
  "supergulp-storia-programma-tv":         { search: "Supergulp", category: "dvd",     label: "DVD di Supergulp" },
  "kriminal-re-fumetti-neri-italiani":     { search: "Kriminal", category: "fumetti", label: "fumetti di Kriminal" },
  "spiderman-fumetti-italiani-editoriale-corno": { search: "Spider", category: "fumetti", label: "fumetti Marvel" },
  "robi-robot-deagostini-storia-robotica": { search: "Robi", category: "oggetti", label: "Robi in negozio" },
  "valter-buio-psicoanalista-fantasmi-bilotta": { search: "Valter Buio", category: "fumetti", label: "numeri di Valter Buio" },
  "shanghai-devil-manfredi-fumetto-bonelli": { search: "Shanghai Devil", category: "fumetti", label: "numeri di Shanghai Devil" },
  "volto-nascosto-manfredi-guerra-coloniale-bonelli": { search: "Volto Nascosto", category: "fumetti", label: "numeri di Volto Nascosto" },
  "alan-ford-gruppo-tnt-storia-fumetto":   { search: "Alan Ford", category: "fumetti", label: "numeri di Alan Ford" },
};

export async function generateStaticParams() {
  return posts.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} — La Soffitta del Collezionista`,
    description: post.excerpt,
    alternates: { canonical: `${BASE_URL}/blog/${slug}` },
    openGraph: { title: post.title, description: post.excerpt, type: "article" },
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
}

function renderContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="font-serif text-2xl font-bold text-white mt-10 mb-4">{line.slice(3)}</h2>
      );
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) {
        items.push(lines[i].slice(2));
        i++;
      }
      elements.push(
        <ul key={i} className="list-none flex flex-col gap-2 my-4">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-2 text-neutral-400 text-sm leading-relaxed">
              <span className="text-accent mt-1 flex-shrink-0">—</span>
              <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (line.trim()) {
      elements.push(
        <p key={i} className="text-neutral-400 text-base leading-relaxed my-4"
          dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>') }} />
      );
    }
    i++;
  }
  return elements;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  // Prodotti e bundle correlati dal catalogo
  const linkCfg = PRODUCT_LINKS[slug];
  let relatedItems: RelatedItem[] = [];
  if (linkCfg) {
    if (linkCfg.search) {
      // Articolo legato a un personaggio: cerca tra prodotti singoli E bundle
      const [{ data: prods }, { data: bundles }] = await Promise.all([
        supabase.from("products").select("id,title,price,images").eq("sold", false).ilike("title", `%${linkCfg.search}%`).limit(4),
        supabase.from("bundles").select("id,title,price,images").ilike("title", `%${linkCfg.search}%`).limit(4),
      ]);
      relatedItems = [
        ...(bundles ?? []).map((b: ItemRow) => ({ id: b.id, title: b.title, price: b.price, image: b.images?.[0], href: `/bundle/${b.id}`, isBundle: true })),
        ...(prods ?? []).map((p: ItemRow) => ({ id: p.id, title: p.title, price: p.price, image: p.images?.[0], href: `/products/${p.id}`, isBundle: false })),
      ].slice(0, 4);
    } else {
      // Articolo-guida: mostra prodotti della categoria
      const { data: prods } = await supabase.from("products").select("id,title,price,images").eq("sold", false).eq("category", linkCfg.category).limit(4);
      relatedItems = (prods ?? []).map((p: ItemRow) => ({ id: p.id, title: p.title, price: p.price, image: p.images?.[0], href: `/products/${p.id}`, isBundle: false }));
    }
  }

  // Articoli correlati: stessa categoria, poi riempi con altri
  const relatedPosts = posts.filter(p => p.slug !== slug && p.category === post.category).slice(0, 3);
  if (relatedPosts.length < 3) {
    const extra = posts.filter(p => p.slug !== slug && !relatedPosts.includes(p)).slice(0, 3 - relatedPosts.length);
    relatedPosts.push(...extra);
  }

  // Dati strutturati per Google
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "it-IT",
    author: { "@type": "Organization", name: "La Soffitta del Collezionista", url: BASE_URL },
    publisher: {
      "@type": "Organization",
      name: "La Soffitta del Collezionista",
      logo: { "@type": "ImageObject", url: `${BASE_URL}/icon-192.svg` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE_URL}/blog/${slug}` },
  };

  // Testi del box CTA in base alla categoria dell'articolo
  const CTA_BY_CATEGORY: Record<string, { title: string; text: string; href: string; button: string }> = {
    dvd: {
      title: "Cerchi DVD da collezione?",
      text: "Sfoglia il catalogo — film, serie TV e cofanetti in continuo aggiornamento.",
      href: "/products?category=dvd",
      button: "Vedi i DVD",
    },
    oggetti: {
      title: "Cerchi oggetti da collezione?",
      text: "Sfoglia il catalogo — modellini, gadget e pezzi unici selezionati con cura.",
      href: "/products?category=oggetti",
      button: "Vedi gli oggetti",
    },
    fumetti: {
      title: "Cerchi fumetti usati?",
      text: "Sfoglia il catalogo — trovi regolarmente Tex, Zagor, Dampyr e molto altro.",
      href: "/products?category=fumetti",
      button: "Vedi i fumetti",
    },
  };
  const cta = CTA_BY_CATEGORY[linkCfg?.category ?? "fumetti"] ?? CTA_BY_CATEGORY.fumetti;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />

      <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-10">
        <ArrowLeft size={14} /> Tutti gli articoli
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-accent uppercase tracking-widest">{post.category}</span>
          <span className="text-neutral-700">·</span>
          <span className="text-xs text-neutral-600 flex items-center gap-1"><Clock size={11} /> {post.readTime} min</span>
          <span className="text-neutral-700">·</span>
          <span className="text-xs text-neutral-600">{formatDate(post.date)}</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">{post.title}</h1>
        <p className="text-neutral-500 text-lg leading-relaxed">{post.excerpt}</p>
      </div>

      <div className="w-full h-px bg-white/5 mb-8" />

      <article>{renderContent(post.content)}</article>

      {/* Prodotti e bundle correlati dal catalogo */}
      {relatedItems.length > 0 && (
        <div className="mt-14">
          <p className="text-xs tracking-[0.3em] uppercase text-accent mb-2">Dal catalogo</p>
          <h3 className="font-serif text-2xl font-bold text-white mb-6">Disponibili in negozio</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedItems.map((item) => (
              <a key={item.id} href={item.href}
                className="group glass border border-border rounded-2xl overflow-hidden hover:border-accent/30 transition-all">
                <div className="relative aspect-[3/4] bg-surface-2">
                  {item.image
                    ? <Image src={item.image} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />
                    : <div className="flex items-center justify-center h-full text-3xl">📦</div>
                  }
                  {item.isBundle && (
                    <span className="absolute top-2 left-2 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Bundle</span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-white text-xs font-medium truncate">{item.title}</p>
                  <p className="text-accent text-xs mt-0.5 font-semibold">€{(item.price / 100).toFixed(2)}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-14 glass border border-accent/20 rounded-3xl p-8 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-accent mb-3">La Soffitta del Collezionista</p>
        <h3 className="font-serif text-2xl font-bold text-white mb-3">{cta.title}</h3>
        <p className="text-neutral-500 text-sm mb-6">{cta.text}</p>
        <Link href={cta.href}
          className="inline-flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-2xl transition-colors text-sm">
          {cta.button} <ArrowRight size={14} />
        </Link>
      </div>

      {/* Leggi anche */}
      {relatedPosts.length > 0 && (
        <div className="mt-16">
          <h3 className="font-serif text-2xl font-bold text-white mb-6">Leggi anche</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {relatedPosts.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`}
                className="group glass border border-border hover:border-accent/30 rounded-2xl p-5 transition-all">
                <span className="text-xs font-semibold text-accent uppercase tracking-widest">{p.category}</span>
                <p className="text-sm text-white font-semibold mt-2 group-hover:text-accent transition-colors leading-snug line-clamp-3">{p.title}</p>
                <span className="inline-flex items-center gap-1 text-accent text-xs font-semibold mt-3 group-hover:gap-2 transition-all">
                  Leggi <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
