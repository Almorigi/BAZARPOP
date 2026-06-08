import { createClient } from "@supabase/supabase-js";
import { Bell, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminAvvisamiPage() {
  // Fetch notify_me con info prodotto
  const { data: requests } = await supabaseAdmin
    .from("notify_me")
    .select("id, email, product_id, created_at, products(title, images, sold, stock)")
    .order("created_at", { ascending: false });

  // Raggruppa per prodotto
  type NM = {
    id: string;
    email: string;
    product_id: string;
    created_at: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    products: any;
  };
  const grouped: Record<string, NM[]> = {};
  for (const r of (requests ?? []) as NM[]) {
    if (!grouped[r.product_id]) grouped[r.product_id] = [];
    grouped[r.product_id].push(r);
  }

  const totalRequests = requests?.length ?? 0;
  const totalProducts = Object.keys(grouped).length;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 py-8">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-6">
        <ArrowLeft size={14} /> Torna all&apos;admin
      </Link>
      <div className="mb-8">
        <p className="text-xs tracking-[0.25em] uppercase text-accent mb-2">Admin</p>
        <div className="flex items-end justify-between">
          <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-3">
            <Bell size={28} className="text-accent" /> Avvisami
          </h1>
          <div className="text-right">
            <p className="text-2xl font-bold text-accent">{totalRequests}</p>
            <p className="text-xs text-neutral-500">{totalProducts} prodotti</p>
          </div>
        </div>
      </div>

      {totalProducts === 0 ? (
        <div className="text-center py-24 text-neutral-600">
          <Bell size={48} className="mx-auto mb-4 opacity-30" />
          <p>Nessuna richiesta di notifica ancora.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(grouped)
            .sort(([, a], [, b]) => b.length - a.length)
            .map(([productId, reqs]) => {
              const product = reqs[0]?.products;
              const isAvailable = product && !product.sold && product.stock > 0;
              return (
                <div key={productId} className="glass border border-border rounded-2xl overflow-hidden">
                  {/* Header prodotto */}
                  <div className="flex items-center gap-4 p-4 border-b border-white/5">
                    {product?.images?.[0] && (
                      <div className="relative w-12 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-surface-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{product?.title ?? productId}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          isAvailable
                            ? "bg-green-500/10 text-green-400 border-green-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>
                          {isAvailable ? "Disponibile" : "Non disponibile"}
                        </span>
                        <span className="text-xs text-neutral-500">{reqs.length} richieste</span>
                      </div>
                    </div>
                    <a
                      href={`/products/${productId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline flex-shrink-0"
                    >
                      Vedi →
                    </a>
                  </div>

                  {/* Lista email */}
                  <div className="divide-y divide-white/5">
                    {reqs.map(r => (
                      <div key={r.id} className="flex items-center justify-between px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <Mail size={12} className="text-neutral-600 flex-shrink-0" />
                          <span className="text-sm text-neutral-300">{r.email}</span>
                        </div>
                        <span className="text-xs text-neutral-600">
                          {new Date(r.created_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
