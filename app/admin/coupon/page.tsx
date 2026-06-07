export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { ArrowLeft, Tag, Plus, Trash2 } from "lucide-react";
import NewCouponForm from "./NewCouponForm";
import DeleteCouponButton from "./DeleteCouponButton";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function CouponPage() {
  const { data: coupons } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-10">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-6">
        <ArrowLeft size={14} /> Torna all&apos;admin
      </Link>

      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-accent mb-1">Admin</p>
          <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-3">
            <Tag size={24} className="text-accent" /> Codici sconto
          </h1>
        </div>
      </div>

      {/* Form nuovo coupon */}
      <div className="glass border border-border rounded-2xl p-6 mb-8">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><Plus size={15} /> Crea nuovo codice</h2>
        <NewCouponForm />
      </div>

      {/* Lista coupon */}
      {!coupons?.length ? (
        <p className="text-neutral-600 text-center py-12">Nessun codice ancora</p>
      ) : (
        <div className="flex flex-col gap-3">
          {coupons.map(c => (
            <div key={c.id} className="glass border border-border rounded-2xl p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-white text-sm">{c.code}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${c.active ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : "text-neutral-500 bg-white/5 border-white/10"}`}>
                    {c.active ? "Attivo" : "Disattivato"}
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  {c.discount_type === "percent" ? `${c.discount_value}% di sconto` : `€${(c.discount_value / 100).toFixed(2)} fisso`}
                  {" · "}{c.max_uses ? `${c.used_count}/${c.max_uses} usi` : `${c.used_count} usi (illimitato)`}
                  {" · "}Scade: {formatDate(c.expires_at)}
                </p>
              </div>
              <DeleteCouponButton id={c.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
