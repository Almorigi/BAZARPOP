export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { ArrowLeft, HandCoins } from "lucide-react";
import { clsx } from "clsx";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const statusConfig: Record<string, { label: string; cls: string }> = {
  pending:  { label: "In attesa",  cls: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  accepted: { label: "Accettata",  cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  rejected: { label: "Rifiutata",  cls: "text-red-400 bg-red-400/10 border-red-400/20" },
};

export default async function AdminOffertePage({ searchParams }: { searchParams: Promise<{ msg?: string }> }) {
  const { msg } = await searchParams;

  const { data: offers } = await supabaseAdmin
    .from("offers")
    .select("*, products(title, price, images)")
    .order("created_at", { ascending: false });

  const pending = offers?.filter(o => o.status === "pending").length ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-10">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white mb-6">
        <ArrowLeft size={14} /> Torna all&apos;admin
      </Link>

      {msg === "accepted" && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-6 text-emerald-400 text-sm">
          ✅ Offerta accettata — il cliente è stato notificato via email.
        </div>
      )}
      {msg === "rejected" && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 text-red-400 text-sm">
          ❌ Offerta rifiutata — il cliente è stato notificato via email.
        </div>
      )}

      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-accent mb-1">Admin</p>
          <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-3">
            <HandCoins size={28} className="text-accent" /> Offerte ricevute
          </h1>
        </div>
        {pending > 0 && (
          <span className="bg-accent text-white text-sm font-bold px-3 py-1 rounded-full">
            {pending} in attesa
          </span>
        )}
      </div>

      {!offers?.length ? (
        <div className="text-center py-20 text-neutral-600">
          <HandCoins size={48} className="mx-auto mb-4 opacity-30" />
          <p>Nessuna offerta ricevuta ancora</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {offers.map(offer => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const product = offer.products as any;
            const status = statusConfig[offer.status] ?? statusConfig.pending;
            const listPrice = product?.price ?? 0;
            const pct = Math.round(((listPrice - offer.amount) / listPrice) * 100);

            return (
              <div key={offer.id} className="glass border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className={clsx("text-xs font-semibold px-2.5 py-1 rounded-full border", status.cls)}>
                      {status.label}
                    </span>
                    <p className="text-xs text-neutral-600 mt-1">
                      {new Date(offer.created_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-accent text-xl">€{(offer.amount / 100).toFixed(2).replace(".", ",")}</p>
                    <p className="text-xs text-neutral-600">
                      su €{(listPrice / 100).toFixed(2).replace(".", ",")} — <span className="text-red-400">-{pct}%</span>
                    </p>
                  </div>
                </div>

                <p className="text-sm font-semibold text-white mb-1">{product?.title ?? "—"}</p>
                <p className="text-xs text-neutral-500 mb-1">{offer.customer_name} · {offer.customer_email}</p>
                {offer.message && (
                  <p className="text-xs text-neutral-400 italic mt-2 bg-white/5 rounded-xl px-3 py-2">
                    &ldquo;{offer.message}&rdquo;
                  </p>
                )}

                {offer.status === "pending" && (
                  <div className="flex gap-2 mt-4">
                    <a href={`/api/offers/${offer.id}/accept`}
                      className="flex-1 text-center bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-sm font-semibold py-2 rounded-xl transition-colors">
                      ✅ Accetta
                    </a>
                    <a href={`/api/offers/${offer.id}/reject`}
                      className="flex-1 text-center bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-semibold py-2 rounded-xl transition-colors">
                      ❌ Rifiuta
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
