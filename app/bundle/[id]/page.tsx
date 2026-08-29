import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Product } from "@/types";
import BundleClient, { BundleGallery } from "./BundleClient";
import type { Metadata } from "next";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase.from("bundles").select("title, description").eq("id", id).single();
  if (!data) return {};
  return { title: `${data.title} — La Soffitta del Collezionista`, description: data.description ?? undefined };
}

export default async function BundlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { data: bundle } = await supabase.from("bundles").select("*").eq("id", id).single();
  if (!bundle) notFound();

  // Carica i prodotti del bundle
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .in("id", bundle.product_ids ?? []);

  const bundleProducts: Product[] = (bundle.product_ids ?? [])
    .map((pid: string) => products?.find((p: Product) => p.id === pid))
    .filter(Boolean);

  const originalTotal = bundleProducts.reduce((s: number, p: Product) => s + p.price, 0);
  const saving = originalTotal - bundle.price;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      {/* Header */}
      <div className="grid md:grid-cols-2 gap-10 mb-16">
        {/* Galleria immagini */}
        <BundleGallery images={bundle.images ?? []} saving={saving} title={bundle.title} fallbackProducts={bundleProducts} />

        {/* Info */}
        <div className="flex flex-col justify-center gap-5">
          <div>
            <span className="text-xs tracking-[0.3em] uppercase text-accent">Bundle{bundleProducts.length > 0 ? ` · ${bundleProducts.length} prodotti` : ""}</span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2 leading-tight">{bundle.title}</h1>
          </div>

          {bundle.description && (
            <p className="text-neutral-400 text-sm leading-relaxed">{bundle.description}</p>
          )}

          <div className="flex items-end gap-4">
            <div className="font-serif text-4xl font-bold text-accent">€{(bundle.price / 100).toFixed(2)}</div>
            {saving > 0 && (
              <div className="pb-1">
                <p className="text-xs text-neutral-600 line-through">€{(originalTotal / 100).toFixed(2)}</p>
                <p className="text-xs text-emerald-400 font-semibold">-{Math.round((saving / originalTotal) * 100)}% di sconto</p>
              </div>
            )}
          </div>

          <BundleClient bundle={bundle} products={bundleProducts} />
        </div>
      </div>

      {/* Lista prodotti inclusi */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-white mb-6">Prodotti inclusi</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {bundleProducts.map((p: Product) => (
            <a key={p.id} href={`/products/${p.id}`}
              className="group glass border border-border rounded-2xl overflow-hidden hover:border-accent/30 transition-all">
              <div className="relative aspect-[3/4] bg-surface-2">
                {p.images[0]
                  ? <Image src={p.images[0]} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="25vw" />
                  : <div className="flex items-center justify-center h-full text-3xl">📦</div>
                }
              </div>
              <div className="p-3">
                <p className="text-white text-xs font-medium truncate">{p.title}</p>
                <p className="text-neutral-500 text-xs mt-0.5 line-through">€{(p.price / 100).toFixed(2)}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
