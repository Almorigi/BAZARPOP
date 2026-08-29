"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, ArrowLeft, Mail, Trash2, Loader2 } from "lucide-react";

interface ItemRequest {
  id: string;
  email: string;
  item: string;
  notes: string | null;
  created_at: string;
}

export default function AdminRichiestePage() {
  const [requests, setRequests] = useState<ItemRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/richieste")
      .then(r => r.json())
      .then(json => setRequests(json.requests ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Eliminare questa richiesta? (fallo dopo aver contattato il cliente)")) return;
    const res = await fetch(`/api/admin/richieste/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.ok) setRequests(reqs => reqs.filter(r => r.id !== id));
    else alert("Errore: " + json.error);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 py-8">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-white transition-colors mb-6">
        <ArrowLeft size={14} /> Torna all&apos;admin
      </Link>
      <div className="mb-8">
        <p className="text-xs tracking-[0.25em] uppercase text-accent mb-2">Admin</p>
        <div className="flex items-end justify-between">
          <h1 className="font-serif text-3xl font-bold text-white flex items-center gap-3">
            <Search size={28} className="text-accent" /> Ricerche pezzi
          </h1>
          <div className="text-right">
            <p className="text-2xl font-bold text-accent">{requests.length}</p>
            <p className="text-xs text-neutral-500">richieste attive</p>
          </div>
        </div>
        <p className="text-neutral-500 text-sm mt-3">
          I clienti cercano questi pezzi. Quando ne trovi uno, contatta il cliente via email e poi elimina la richiesta.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-accent" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-24 text-neutral-600">
          <Search size={48} className="mx-auto mb-4 opacity-30" />
          <p>Nessuna richiesta di ricerca ancora.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map(r => (
            <div key={r.id} className="glass border border-border rounded-2xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{r.item}</p>
                  {r.notes && <p className="text-neutral-500 text-xs mt-1">{r.notes}</p>}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <a href={`mailto:${r.email}?subject=${encodeURIComponent(`Abbiamo trovato: ${r.item} — La Soffitta del Collezionista`)}`}
                      className="flex items-center gap-1.5 text-xs text-accent hover:underline">
                      <Mail size={12} /> {r.email}
                    </a>
                    <span className="text-xs text-neutral-600">
                      {new Date(r.created_at).toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleDelete(r.id)}
                  className="flex-shrink-0 text-neutral-600 hover:text-red-400 transition-colors p-1.5"
                  title="Elimina richiesta">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
