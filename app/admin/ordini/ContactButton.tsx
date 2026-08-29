"use client";
import { useState } from "react";
import { Mail } from "lucide-react";

interface Props {
  customerName: string;
  customerEmail: string;
  hasPhone: boolean;
}

const FIRMA = "\n\nGrazie e a presto,\nLa Soffitta del Collezionista\nlasoffittadelcollezionista.it";

export default function ContactButton({ customerName, customerEmail, hasPhone }: Props) {
  const [aperto, setAperto] = useState(false);
  const nome = customerName?.split(" ")[0] || "";

  // Si apre la finestra di scrittura di Gmail in una nuova scheda, invece di
  // inviare dal sito: così la risposta del cliente arriva nella casella reale
  // e non a un indirizzo noreply, e la copia resta in Posta inviata.
  function scrivi(oggetto: string, testo: string) {
    const url =
      "https://mail.google.com/mail/?view=cm&fs=1" +
      `&to=${encodeURIComponent(customerEmail)}` +
      `&su=${encodeURIComponent(oggetto)}` +
      `&body=${encodeURIComponent(testo)}`;
    window.open(url, "_blank", "noopener");
    setAperto(false);
  }

  const modelli = [
    {
      etichetta: "Chiedi il telefono",
      mostra: !hasPhone,
      oggetto: "Il tuo ordine su La Soffitta del Collezionista",
      testo:
        `Gentile ${nome},\n\ngrazie per il suo ordine su La Soffitta del Collezionista.\n\n` +
        `Il pacco è pronto per la spedizione. Per completare la consegna avremmo bisogno di un recapito telefonico: ` +
        `il corriere lo utilizza per avvisarla dell'arrivo ed eventualmente concordare la consegna.\n\n` +
        `Può rispondere a questa email indicandoci il numero, così procediamo subito.` + FIRMA,
    },
    {
      etichetta: "Avvisa di un ritardo",
      mostra: true,
      oggetto: "Aggiornamento sul tuo ordine",
      testo:
        `Gentile ${nome},\n\nle scriviamo per aggiornarla sul suo ordine.\n\n` +
        `[Spiega qui il motivo del ritardo e i nuovi tempi previsti]\n\n` +
        `Ci scusiamo per l'attesa e restiamo a disposizione per qualsiasi necessità.` + FIRMA,
    },
    {
      etichetta: "Messaggio libero",
      mostra: true,
      oggetto: "Il tuo ordine su La Soffitta del Collezionista",
      testo: `Gentile ${nome},\n\n` + FIRMA,
    },
  ].filter(m => m.mostra);

  if (!customerEmail) return null;

  if (!aperto) return (
    <button onClick={() => setAperto(true)}
      className="text-xs bg-[#1e1e1e] hover:bg-[#2a2a2a] text-neutral-300 px-3 py-1.5 rounded-xl border border-white/10 transition-colors flex items-center gap-1">
      <Mail size={11} /> Scrivi al cliente
    </button>
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {modelli.map(m => (
        <button key={m.etichetta} onClick={() => scrivi(m.oggetto, m.testo)}
          className="text-xs bg-accent/10 hover:bg-accent/20 text-accent px-3 py-1.5 rounded-xl border border-accent/20 transition-colors">
          {m.etichetta}
        </button>
      ))}
      <button onClick={() => setAperto(false)} className="text-xs text-neutral-600 hover:text-white px-2">✕</button>
    </div>
  );
}
