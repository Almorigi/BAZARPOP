export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { ArrowLeft, Package, User, MapPin } from "lucide-react";
import { clsx } from "clsx";
import ShipButton from "./ShipButton";
import PrintButton from "./PrintButton";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const statusConfig: Record<string, { label: string; cls: string }> = {
  paid:     { label: "Pagato",    cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  shipped:  { label: "Spedito",   cls: "text-sky-400 bg-sky-400/10 border-sky-400/20" },
  delivered:{ label: "Consegnato",cls: "text-purple-400 bg-purple-400/10 border-purple-400/20" },
};

function formatPrice(cents: number) {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function OrdiniPage() {
  const { data: orders } = await supabaseAdmin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  const totalRevenue = (orders ?? []).reduce((sum, o) => sum + (o.total ?? 0), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-10">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-6">
        <ArrowLeft size={14} /> Torna all&apos;admin
      </Link>

      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-accent mb-1">Admin</p>
          <h1 className="font-serif text-3xl font-bold text-white">Ordini</h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-500 mb-1">Totale incassato</p>
          <p className="font-serif text-2xl font-bold text-accent">{formatPrice(totalRevenue)}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Totale ordini", value: orders?.length ?? 0 },
          { label: "Pagati", value: orders?.filter(o => o.status === "paid").length ?? 0 },
          { label: "Spediti", value: orders?.filter(o => o.status === "shipped").length ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="glass rounded-2xl p-4 border border-border text-center">
            <div className="font-serif text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-xs text-neutral-600">{label}</div>
          </div>
        ))}
      </div>

      {/* Lista ordini */}
      {!orders?.length ? (
        <div className="text-center py-20 text-neutral-600">
          <Package size={48} className="mx-auto mb-4 opacity-30" />
          <p>Nessun ordine ancora</p>
          <p className="text-sm mt-1">Gli ordini appariranno qui dopo i pagamenti completati</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const status = statusConfig[order.status] ?? statusConfig.paid;
            const items = order.items as { name: string; qty: number; price: number }[];
            return (
              <div key={order.id} className="glass border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={clsx("text-xs font-semibold px-2.5 py-1 rounded-full border", status.cls)}>
                        {status.label}
                      </span>
                      <span className="text-xs text-neutral-600">{formatDate(order.created_at)}</span>
                    </div>
                    <p className="text-xs text-neutral-600 font-mono">{order.id}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-accent text-lg">{formatPrice(order.total)}</p>
                    <p className="text-xs text-neutral-600">+ {formatPrice(order.shipping)} sped.</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  <div className="flex items-start gap-2">
                    <User size={13} className="text-neutral-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-white font-medium">{order.customer_name}</p>
                      <p className="text-xs text-neutral-500">{order.customer_email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={13} className="text-neutral-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-neutral-400">{order.address}</p>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3">
                  <p className="text-xs text-neutral-500 mb-2 flex items-center gap-1"><Package size={11} /> Prodotti acquistati</p>
                  <div className="flex flex-col gap-1">
                    {items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-neutral-300">{item.name} <span className="text-neutral-600">×{item.qty}</span></span>
                        <span className="text-white font-medium">{formatPrice(item.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/5 flex gap-2 flex-wrap items-center">
                  {order.tracking_number && order.status !== "paid" && (
                    <span className="text-xs text-neutral-500 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                      📦 Tracking: <span className="text-white font-mono">{order.tracking_number}</span>
                    </span>
                  )}
                  <ShipButton orderId={order.id} currentStatus={order.status} />
                  <PrintButton order={{
                    id: order.id,
                    created_at: order.created_at,
                    customer_name: order.customer_name,
                    customer_email: order.customer_email,
                    address: order.address,
                    items: items,
                    total: order.total,
                    shipping: order.shipping,
                    tracking_number: order.tracking_number,
                    status: order.status,
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

