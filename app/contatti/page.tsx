import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageCircle, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Contatti & FAQ — La Soffitta del Collezionista",
  description: "Hai domande? Contattaci via WhatsApp o email. Risposte alle domande più frequenti su spedizioni, pagamenti e resi.",
};

async function getShippingThreshold(): Promise<number> {
  const { data } = await supabase.from("settings").select("value").eq("key", "shipping_free_threshold").single();
  return data ? parseInt(data.value) : 4000;
}

const FAQ_STATIC = [
  {
    q: "Come avviene la spedizione?",
    a: "Spediamo in tutta Italia tramite corriere. La spedizione standard impiega 3–7 giorni lavorativi, quella express 1–2 giorni. Per ordini di fumetti, libri (max 2), videogiochi e DVD fino a 5 articoli è disponibile anche la tariffa economica Piego di libri raccomandato di Poste Italiane, con tracciatura e firma alla consegna (4–10 giorni lavorativi). Ricevi un'email con il codice di tracciamento non appena il pacco viene spedito.",
  },
  {
    q: "Quali metodi di pagamento accettate?",
    a: "Accettiamo tutte le principali carte di credito e debito (Visa, Mastercard, American Express), PayPal, Satispay, Klarna (anche a rate) e Apple Pay / Google Pay. Tutti i pagamenti passano da Stripe, la piattaforma di pagamento più sicura al mondo.",
  },
];

export default async function ContattiPage() {
  const freeThreshold = await getShippingThreshold();
  const thresholdEur = (freeThreshold / 100).toFixed(0);

  const FAQ = [
    ...FAQ_STATIC,
    {
      q: "La spedizione è gratuita?",
      a: `Sì! La spedizione è gratuita per ordini superiori a €${thresholdEur}. Per ordini inferiori la spedizione standard ha un piccolo costo visibile al checkout.`,
    },
    {
      q: "I prodotti sono controllati prima della vendita?",
      a: "Assolutamente sì. Ogni prodotto è selezionato e ispezionato personalmente. La condizione (Nuovo, Ottimo, Buono, Discreto) è indicata nella scheda prodotto con onestà.",
    },
    {
      q: "Posso restituire un acquisto?",
      a: "Se il prodotto non corrisponde alla descrizione, contattaci entro 14 giorni dal ricevimento. Valutiamo ogni caso singolarmente e troviamo sempre una soluzione.",
    },
    {
      q: "Come posso sapere dov'è il mio ordine?",
      a: "Ricevi un'email con il link per seguire il tuo ordine non appena viene spedito. Puoi anche accedere alla pagina di tracciamento usando il link nell'email di conferma.",
    },
    {
      q: "Vendete anche all'estero?",
      a: "Per ora spediamo solo in Italia. Se sei interessato a un prodotto e sei all'estero, contattaci: valutiamo caso per caso.",
    },
    {
      q: "Come vengono imballati i prodotti?",
      a: "I fumetti e libri vengono protetti con buste rigide o cartoni appositi per evitare pieghe e danni durante il trasporto. La cura nell'imballaggio è una nostra priorità.",
    },
  ];

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <div className="mb-12">
        <p className="text-xs tracking-[0.25em] uppercase text-accent mb-2">Siamo qui</p>
        <h1 className="font-serif text-4xl font-bold text-white mb-4">Contatti & FAQ</h1>
        <p className="text-neutral-400">Hai una domanda? Scrivi su WhatsApp per una risposta rapida, oppure leggi le domande frequenti qui sotto.</p>
      </div>

      {/* Contatti */}
      <div className="grid sm:grid-cols-2 gap-4 mb-16">
        <a href="https://wa.me/393917753259" target="_blank" rel="noopener noreferrer"
          className="group glass border border-border hover:border-[#25D366]/30 rounded-2xl p-6 transition-all hover:-translate-y-0.5">
          <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center mb-4">
            <MessageCircle size={20} className="text-[#25D366]" />
          </div>
          <h2 className="font-semibold text-white mb-1">WhatsApp</h2>
          <p className="text-sm text-neutral-500 mb-3">Risposta in pochi minuti</p>
          <span className="text-sm text-[#25D366] group-hover:underline">Scrivi ora →</span>
        </a>

        <a href="mailto:amoro6321@gmail.com"
          className="group glass border border-border hover:border-accent/30 rounded-2xl p-6 transition-all hover:-translate-y-0.5">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
            <Mail size={20} className="text-accent" />
          </div>
          <h2 className="font-semibold text-white mb-1">Email</h2>
          <p className="text-sm text-neutral-500 mb-3">Risposta entro 24h</p>
          <span className="text-sm text-accent group-hover:underline">Scrivi un&apos;email →</span>
        </a>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-white mb-6">Domande frequenti</h2>
        <div className="flex flex-col gap-3">
          {FAQ.map((item, i) => (
            <details key={i} className="group glass border border-border rounded-2xl overflow-hidden">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none">
                <span className="font-medium text-white text-sm">{item.q}</span>
                <ChevronDown size={16} className="text-neutral-500 group-open:rotate-180 transition-transform flex-shrink-0 ml-3" />
              </summary>
              <div className="px-5 pb-4 text-sm text-neutral-400 leading-relaxed border-t border-white/5 pt-3">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <p className="text-neutral-600 text-sm mb-4">Non hai trovato risposta?</p>
        <a href="https://wa.me/393917753259" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20b958] text-white font-bold px-6 py-3 rounded-2xl transition-colors text-sm">
          <MessageCircle size={16} /> Chiedici su WhatsApp
        </a>
      </div>
    </div>
  );
}
