"use client";
import { useState } from "react";
import { HelpCircle, X } from "lucide-react";

const CONDITIONS = [
  {
    value: "nuovo",
    label: "Nuovo",
    cls: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
    dot: "bg-emerald-400",
    description: "Mai usato, in confezione originale o perfettamente integro. Come appena comprato in negozio.",
    details: [
      "Nessun segno di uso o apertura",
      "Fumetti e libri: copertina e pagine perfette",
      "DVD e videogiochi: spesso ancora sigillati",
      "Oggetti: confezione originale se prevista",
    ],
    example: "Fumetto mai aperto, DVD sigillato, action figure ancora in blister.",
  },
  {
    value: "ottimo",
    label: "Ottimo",
    cls: "text-sky-400 bg-sky-400/10 border-sky-400/30",
    dot: "bg-sky-400",
    description: "Usato pochissimo, conservato con cura. Difetti appena percettibili solo a ispezione ravvicinata.",
    details: [
      "Aspetto praticamente perfetto",
      "Fumetti e libri: pagine pulite, dorso integro, al più una lieve piega",
      "DVD e videogiochi: disco senza graffi, custodia in perfetto stato",
      "Oggetti: completi e perfettamente funzionanti, minimi segni di maneggiamento",
    ],
    example: "Fumetto letto una volta con attenzione. Videogioco con custodia originale in perfetto stato. Modellino esposto in vetrina.",
  },
  {
    value: "buono",
    label: "Buono",
    cls: "text-amber-400 bg-amber-400/10 border-amber-400/30",
    dot: "bg-amber-400",
    description: "Usato normalmente, segni d'uso visibili ma il prodotto è completo e perfettamente funzionante.",
    details: [
      "Segni d'uso lievi ma visibili",
      "Fumetti e libri: possibili piccole pieghe, leggero ingiallimento, nessuno strappo",
      "DVD e videogiochi: lievi graffi che non compromettono la riproduzione",
      "Oggetti: funzionanti, con normali segni d'uso su superfici o confezione",
    ],
    example: "Romanzo letto più volte. Console con qualche graffietto sulla scocca. Giocattolo d'epoca usato ma completo.",
  },
  {
    value: "discreto",
    label: "Discreto",
    cls: "text-neutral-400 bg-white/5 border-white/20",
    dot: "bg-neutral-400",
    description: "Segni d'uso evidenti ma il prodotto è completo e funzionante. Ideale per chi vuole il pezzo a prezzo minimo.",
    details: [
      "Usura visibile a colpo d'occhio",
      "Fumetti e libri: copertina consumata, possibili annotazioni o piccoli strappi riparati",
      "DVD e videogiochi: custodia rovinata o sostituita, disco comunque leggibile",
      "Oggetti: difetti estetici evidenti, possibile confezione mancante, ma funzionanti",
    ],
    example: "Fumetto vintage con copertina consumata. Libro con dedica. Oggetto da collezione senza scatola originale.",
  },
];

export default function ConditionGuide({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={compact
          ? "inline-flex items-center gap-1 text-[11px] text-neutral-600 hover:text-neutral-400 transition-colors"
          : "inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-accent transition-colors"
        }
        title="Guida alle condizioni"
      >
        <HelpCircle size={compact ? 11 : 13} />
        {compact ? "Cosa significa?" : "Guida alle condizioni"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#111] border border-white/10 rounded-3xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#111]/95 backdrop-blur-sm border-b border-white/5 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="font-serif text-xl font-bold text-white">Guida alle condizioni</h2>
                <p className="text-xs text-neutral-500 mt-0.5">Come valutiamo ogni prodotto</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-white/5 transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-5">
              {CONDITIONS.map(c => (
                <div key={c.value} className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.dot}`} />
                    <span className={`text-sm font-bold px-3 py-1 rounded-full border ${c.cls}`}>{c.label}</span>
                  </div>
                  <p className="text-neutral-300 text-sm leading-relaxed mb-3">{c.description}</p>
                  <ul className="space-y-1 mb-3">
                    {c.details.map(d => (
                      <li key={d} className="text-xs text-neutral-500 flex items-start gap-2">
                        <span className="text-neutral-700 mt-0.5">•</span> {d}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-neutral-600 italic border-t border-white/5 pt-3">
                    Es: {c.example}
                  </p>
                </div>
              ))}

              <div className="bg-accent/5 border border-accent/15 rounded-2xl p-4">
                <p className="text-xs text-neutral-400 leading-relaxed">
                  <strong className="text-accent">Nota:</strong> Ogni prodotto viene valutato personalmente prima della vendita.
                  Se hai dubbi sulle condizioni di un articolo specifico, scrivici su{" "}
                  <a href="/contatti" className="text-accent hover:underline">WhatsApp o email</a> — ti inviamo foto aggiuntive.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
