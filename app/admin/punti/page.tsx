export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { ArrowLeft, Trophy, Medal } from "lucide-react";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminPuntiPage() {
  const { data: rows } = await supabaseAdmin
    .from("loyalty_points")
    .select("email, points, created_at");

  // Aggrega per email
  const byEmail = new Map<string, { total: number; entries: number; last: string }>();
  for (const r of rows ?? []) {
    const cur = byEmail.get(r.email) ?? { total: 0, entries: 0, last: r.created_at };
    cur.total += r.points;
    cur.entries += 1;
    if (r.created_at > cur.last) cur.last = r.created_at;
    byEmail.set(r.email, cur);
  }
  const ranking = [...byEmail.entries()]
    .map(([email, v]) => ({ email, ...v }))
    .sort((a, b) => b.total - a.total);

  const totalPoints = ranking.reduce((s, r) => s + r.total, 0);

  const medalCls = ["text-amber-400", "text-neutral-300", "text-orange-700"];

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-10">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white mb-6">
        <ArrowLeft size={14} /> Torna all&apos;admin
      </Link>

      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-accent mb-1">Admin</p>
          <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-3">
            <Trophy size={24} className="text-accent" /> Punti fedeltà
          </h1>
        </div>
        <div className="text-right">
          <div className="font-serif text-2xl font-bold text-accent">{totalPoints}</div>
          <div className="text-xs text-neutral-600">punti totali · {ranking.length} clienti</div>
        </div>
      </div>

      {ranking.length === 0 ? (
        <div className="text-center py-16 text-neutral-600">Nessun punto assegnato ancora.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {ranking.map((r, i) => (
            <div key={r.email} className="flex items-center gap-4 bg-neutral-900 rounded-2xl p-4 border border-neutral-700">
              <div className="w-8 text-center flex-shrink-0">
                {i < 3
                  ? <Medal size={20} className={medalCls[i]} />
                  : <span className="text-neutral-600 text-sm font-bold">{i + 1}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{r.email}</p>
                <p className="text-xs text-neutral-600">
                  {r.entries} movimenti · ultimo {new Date(r.last).toLocaleDateString("it-IT")}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-serif text-xl font-bold text-accent">{r.total} pt</div>
                <div className="text-xs text-neutral-600">≈ €{(Math.floor(r.total / 100) * 5).toFixed(0)} in buoni</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-neutral-600 mt-6">
        💡 100 punti = buono da €5. Quando un cliente raggiunge la soglia, crea un coupon dedicato in{" "}
        <Link href="/admin/coupon" className="text-accent hover:underline">Coupon</Link>.
      </p>
    </div>
  );
}
