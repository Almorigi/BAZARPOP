import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  title: "Termini e Condizioni — La Soffitta del Collezionista",
  description: "Termini e condizioni di vendita del negozio.",
  robots: { index: false, follow: false },
};

async function getShippingSettings() {
  const { data } = await supabase.from("settings").select("key, value");
  const map: Record<string, number> = {};
  for (const row of data ?? []) map[row.key] = parseInt(row.value);
  return {
    standard: map.shipping_standard ?? 890,
    express: map.shipping_express ?? 1390,
    free: map.shipping_free_threshold ?? 4000,
  };
}

export default async function TerminiPage() {
  const shipping = await getShippingSettings();
  return (
    <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
      <p className="text-xs tracking-[0.25em] uppercase text-accent mb-2">Legale</p>
      <h1 className="font-serif text-4xl font-bold text-white mb-10">Termini e Condizioni di Vendita</h1>

      <div className="prose prose-invert prose-sm max-w-none space-y-8 text-neutral-400 leading-relaxed">

        {/* Disclaimer in evidenza */}
        <div className="bg-accent/5 border border-accent/20 rounded-2xl px-5 py-4 mb-4">
          <p className="text-sm text-neutral-300 leading-relaxed">
            <strong className="text-accent">Nota importante:</strong> Tutti gli articoli in vendita provengono dalla collezione personale del venditore e sono beni usati di proprietà privata. Non viene svolta attività professionale di commercio.
          </p>
        </div>

        <section>
          <h2 className="font-serif text-xl font-bold text-white mb-3">1. Venditore</h2>
          <p>
            La Soffitta del Collezionista è un negozio online di articoli da collezione gestito da un privato.
            Tutti gli articoli provengono dalla collezione personale del venditore e sono beni usati di proprietà privata. Non viene svolta alcuna attività professionale o abituale di commercio.
            Per qualsiasi comunicazione: <a href="mailto:amoro6321@gmail.com" className="text-accent hover:underline">amoro6321@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-white mb-3">2. Prodotti</h2>
          <p>
            I prodotti venduti sono prevalentemente articoli usati (fumetti, libri, videogiochi, DVD, oggetti vari).
            Le condizioni di ciascun prodotto sono indicate nella relativa scheda. Le fotografie sono reali e
            rappresentative dell&apos;effettivo stato dell&apos;articolo.
          </p>
          <p className="mt-2">
            Tutti i prodotti sono disponibili in un&apos;unica unità salvo diversa indicazione.
            In caso di esaurimento scorte dopo l&apos;acquisto, rimborsiamo integralmente l&apos;importo pagato.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-white mb-3">3. Prezzi e pagamenti</h2>
          <p>
            I prezzi sono indicati in euro (€) e comprensivi di IVA ove applicabile.
            I pagamenti sono gestiti in modo sicuro tramite Stripe (carta di credito/debito, Apple Pay, Google Pay).
            Non archiviamo dati di pagamento.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-white mb-3">4. Spedizioni</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-white">Spedizione Standard:</strong> €{(shipping.standard / 100).toFixed(2).replace(".", ",")} — consegna in 3-5 giorni lavorativi</li>
            <li><strong className="text-white">Spedizione Express:</strong> €{(shipping.express / 100).toFixed(2).replace(".", ",")} — consegna in 1-2 giorni lavorativi</li>
            <li><strong className="text-white">Spedizione gratuita</strong> per ordini superiori a €{(shipping.free / 100).toFixed(0)}</li>
          </ul>
          <p className="mt-2">
            Spediamo in tutta Italia. Il tracking sarà inviato via email. I tempi di evasione sono di 1-2 giorni lavorativi.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-white mb-3">5. Diritto di recesso</h2>
          <p>
            In conformità al D.Lgs. 206/2005 (Codice del Consumo), hai il diritto di recedere dall&apos;acquisto
            entro <strong className="text-white">14 giorni</strong> dalla ricezione della merce, senza necessità di fornire
            motivazioni.
          </p>
          <p className="mt-2">
            Per esercitare il recesso scrivi a{" "}
            <a href="mailto:amoro6321@gmail.com" className="text-accent hover:underline">amoro6321@gmail.com</a>{" "}
            indicando l&apos;ordine di riferimento. Il prodotto deve essere restituito nelle stesse condizioni di ricezione.
            Le spese di restituzione sono a carico dell&apos;acquirente.
          </p>
          <p className="mt-2">
            Il rimborso sarà effettuato entro 14 giorni dalla ricezione del reso, sullo stesso metodo di pagamento usato.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-white mb-3">6. Garanzia</h2>
          <p>
            Per i prodotti usati si applica la garanzia legale di conformità di 12 mesi (art. 132 Codice del Consumo).
            Per difetti non segnalati nella descrizione del prodotto, contattaci entro 12 mesi dall&apos;acquisto.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-white mb-3">7. Reclami e controversie</h2>
          <p>
            Per qualsiasi reclamo scrivi a{" "}
            <a href="mailto:amoro6321@gmail.com" className="text-accent hover:underline">amoro6321@gmail.com</a>.
            Risponderemo entro 3 giorni lavorativi. Per le controversie si applicano le leggi italiane.
            Per la risoluzione alternativa delle controversie è disponibile la piattaforma ODR della Commissione Europea.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-white mb-3">8. Aggiornamenti</h2>
          <p>
            I presenti termini possono essere modificati. La versione aggiornata è sempre disponibile su questa pagina.
            Ultimo aggiornamento: giugno 2026.
          </p>
        </section>

      </div>
    </div>
  );
}
