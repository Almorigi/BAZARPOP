export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, PlusCircle, Package } from "lucide-react";
import DeleteBundleButton from "./DeleteBundleButton";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function BundlePage() {
  const { data: bundles } = await supabaseAdmin
    .from("bundles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-10">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-6">
        <ArrowLeft size={14} /> Torna all&apos;admin
      </Link>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-accent mb-1">Admin</p>
          <h1 className="font-serif text-3xl font-bold text-white">Bundle & Lotti</h1>
        </div>
        <Link href="/admin/bundle/new"
          className="flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm">
          <PlusCircle size={16} /> Nuovo bundle
        </Link>
      </div>

      {!bundles?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Package size={48} className="text-neutral-700 mb-4" />
          <p className="text-neutral-500">Nessun bundle ancora. Creane uno!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {bundles.map(b => (
            <div key={b.id} className="flex items-center gap-4 glass border border-border rounded-2xl p-4">
              <div className="relative w-14 flex-shrink-0 rounded-xl overflow-hidden bg-surface-3" style={{ height: "72px" }}>
                {b.images?.[0]
                  ? <Image src={b.images[0]} alt={b.title} fill className="object-cover" sizes="56px" />
                  : <div className="flex items-center justify-center h-full text-xl">📦</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{b.title}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{b.product_ids?.length ?? 0} prodotti · €{(b.price / 100).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/admin/bundle/${b.id}`}
                  className="text-xs text-neutral-400 hover:text-white bg-[#1e1e1e] hover:bg-[#2a2a2a] px-3 py-1.5 rounded-xl transition-colors">
                  Modifica
                </Link>
                <DeleteBundleButton id={b.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
