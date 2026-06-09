export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { clsx } from "clsx";
import UpdateReturnStatus from "./UpdateReturnStatus";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const statusConfig: Record<string, { label: string; cls: string }> = {
  pending:   { label: "In attesa",  cls: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
  approved:  { label: "Approvato",  cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" },
  rejected:  { label: "Rifiutato",  cls: "text-red-400 bg-red-400/10 border-red-400/20" },
  completed: { label: "Completato", cls: "text-sky-400 bg-sky-400/10 border-sky-400/20" },
};

export default async function AdminResiPage() {
  const { data: returns } = await supabaseAdmin
    .from("returns")
    .select("*")
    .order("created_at", { ascending: false });

  const pending = returns?.filter(r => r.status === "pending").length ?? 0;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-10">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white mb-6">
        <ArrowLeft size={14} /> Torna all&apos;admin
      </Link>

      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-accent mb-1">Admin</p>
          <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-3">
            <RotateCcw size={24} className="text-accent" /> Resi
          </h1>
        </div>
        {pending > 0 && (
          <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-sm font-bold px-3 py-1 rounded-full">
            {pending} in attesa
          </span>
        )}
      </div>

      {!returns?.length ? (
        <div className="text-center py-20 text-neutral-600">
          <RotateCcw size={48} className="mx-auto mb-4 opacity-30" />
          <p>Nessuna richiesta di reso</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {returns.map(r => {
            const status = statusConfig[r.status] ?? statusConfig.pending;
            return (
              <div key={r.id} className="glass border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <span className={clsx("text-xs font-semibold px-2.5 py-1 rounded-full border", status.cls)}>
                      {status.label}
                    </span>
                    <p className="text-xs text-neutral-600 mt-1">
                      {new Date(r.created_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <code className="text-xs font-mono text-accent bg-accent/10 px-2 py-1 rounded-lg">#{r.order_id}</code>
                </div>

                <p className="text-sm font-semibold text-white">{r.customer_name}</p>
                <p className="text-xs text-neutral-500 mb-2">{r.customer_email}</p>
                <p className="text-sm text-neutral-400 mb-1"><span className="text-neutral-600">Motivo:</span> {r.reason}</p>
                {r.items && <p className="text-xs text-neutral-500 mb-1">Prodotti: {r.items}</p>}
                {r.admin_notes && (
                  <p className="text-xs text-neutral-400 italic bg-white/5 rounded-xl px-3 py-2 mt-2">
                    &ldquo;{r.admin_notes}&rdquo;
                  </p>
                )}

                <div className="mt-4">
                  <UpdateReturnStatus returnId={r.id} currentStatus={r.status} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
