export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { ArrowLeft, Mail, Download } from "lucide-react";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function NewsletterAdminPage() {
  const { data: subscribers } = await supabaseAdmin
    .from("newsletter")
    .select("*")
    .order("created_at", { ascending: false });

  const list = subscribers ?? [];

  // Genera CSV inline
  const csv = ["Email,Data iscrizione", ...list.map(s =>
    `${s.email},${new Date(s.created_at).toLocaleDateString("it-IT")}`
  )].join("\n");

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 pb-10">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-6">
        <ArrowLeft size={14} /> Torna all&apos;admin
      </Link>

      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs tracking-[0.25em] uppercase text-accent mb-1">Admin</p>
          <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-3">
            <Mail size={24} className="text-accent" /> Newsletter
          </h1>
          <p className="text-neutral-500 text-sm mt-1">{list.length} iscritti</p>
        </div>
        {list.length > 0 && (
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}
            download="newsletter.csv"
            className="flex items-center gap-2 bg-[#1e1e1e] hover:bg-[#2a2a2a] text-neutral-300 font-medium px-4 py-2.5 rounded-xl transition-colors text-sm border border-white/10"
          >
            <Download size={14} /> Esporta CSV
          </a>
        )}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-16 text-neutral-600">
          <Mail size={40} className="mx-auto mb-4 opacity-30" />
          <p>Nessun iscritto ancora</p>
        </div>
      ) : (
        <div className="glass border border-border rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-5 py-3 text-xs text-neutral-500 font-medium">#</th>
                <th className="text-left px-5 py-3 text-xs text-neutral-500 font-medium">Email</th>
                <th className="text-right px-5 py-3 text-xs text-neutral-500 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s, i) => (
                <tr key={s.id} className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-3 text-neutral-600">{i + 1}</td>
                  <td className="px-5 py-3 text-white">{s.email}</td>
                  <td className="px-5 py-3 text-neutral-500 text-right text-xs">
                    {new Date(s.created_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
