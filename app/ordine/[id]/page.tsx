export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Package, CheckCircle, Truck, Home, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const metadata: Metadata = {
  title: "Stato ordine — La Soffitta del Collezionista",
  robots: { index: false, follow: false },
};

const steps = [
  { key: "paid",      label: "Ordine ricevuto",  icon: CheckCircle, desc: "Il pagamento è stato confermato" },
  { key: "shipped",   label: "Spedito",           icon: Truck,       desc: "Il pacco è in viaggio verso di te" },
  { key: "delivered", label: "Consegnato",        icon: Home,        desc: "Il pacco è arrivato a destinazione" },
];

function formatPrice(cents: number) {
  return `€${(cents / 100).toFixed(2).replace(".", ",")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Usiamo il client anonimo — RLS deve permettere la lettura per ID
  // (in alternativa, facciamo via route API server-side con service role)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const currentStep = steps.findIndex(s => s.key === order.status);
  const items = order.items as { name: string; qty: number; price: number }[];

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-16">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-8">
        <ArrowLeft size={14} /> Torna al sito
      </Link>

      <div className="mb-8">
        <p className="text-xs tracking-[0.25em] uppercase text-accent mb-2">Il tuo ordine</p>
        <h1 className="font-serif text-3xl font-bold text-white">Stato spedizione</h1>
        <p className="text-neutral-500 text-sm mt-2">Ordine del {formatDate(order.created_at)}</p>
      </div>

      {/* Stepper */}
      <div className="glass border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-0">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const done = i <= currentStep;
            const active = i === currentStep;
            return (
              <div key={step.key} className="flex-1 flex flex-col items-center relative">
                {/* Linea connettore */}
                {i < steps.length - 1 && (
                  <div className={`absolute top-5 left-1/2 w-full h-0.5 z-0 ${i < currentStep ? "bg-accent" : "bg-white/10"}`} />
                )}
                {/* Cerchio */}
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors mb-3 ${
                  done ? "bg-accent border-accent" : "bg-surface-2 border-border"
                } ${active ? "shadow-[0_0_20px_rgba(249,115,22,0.4)]" : ""}`}>
                  <Icon size={16} className={done ? "text-white" : "text-neutral-600"} />
                </div>
                <p className={`text-xs font-semibold text-center ${done ? "text-white" : "text-neutral-600"}`}>{step.label}</p>
                {active && <p className="text-[10px] text-neutral-500 text-center mt-1 px-2">{step.desc}</p>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tracking number */}
      {order.tracking_number && (
        <div className="glass border border-emerald-400/20 bg-emerald-400/5 rounded-2xl p-5 mb-6 text-center">
          <p className="text-xs text-emerald-400 tracking-wider uppercase mb-2">Codice di tracciamento</p>
          <p className="font-mono text-xl font-bold text-white tracking-widest">{order.tracking_number}</p>
          <p className="text-xs text-neutral-500 mt-2">Inserisci questo codice sul sito del corriere</p>
        </div>
      )}

      {/* Riepilogo */}
      <div className="glass border border-border rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Package size={14} className="text-accent" />
          <h2 className="font-semibold text-white text-sm">Riepilogo ordine</h2>
        </div>
        <div className="flex flex-col gap-2 mb-4">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-neutral-300">{item.name} <span className="text-neutral-600">×{item.qty}</span></span>
              <span className="text-white font-medium">{formatPrice(item.price)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-3 flex flex-col gap-1">
          <div className="flex justify-between text-sm text-neutral-500">
            <span>Spedizione</span>
            <span>{order.shipping === 0 ? "Gratuita 🎉" : formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-white">Totale</span>
            <span className="text-accent text-lg">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Indirizzo di consegna */}
      <div className="glass border border-border rounded-2xl p-5">
        <p className="text-xs text-neutral-500 mb-1">Consegna a</p>
        <p className="text-white font-medium">{order.customer_name}</p>
        <p className="text-sm text-neutral-400">{order.address}</p>
      </div>

      <p className="text-center text-xs text-neutral-600 mt-8">
        Per assistenza scrivi a{" "}
        <a href="mailto:amoro6321@gmail.com" className="text-accent hover:underline">amoro6321@gmail.com</a>
      </p>
    </div>
  );
}
