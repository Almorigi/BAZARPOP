import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — La Soffitta del Collezionista",
  description: "Informativa sulla privacy e sul trattamento dei dati personali.",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
      <p className="text-xs tracking-[0.25em] uppercase text-accent mb-2">Legale</p>
      <h1 className="font-serif text-4xl font-bold text-white mb-10">Privacy Policy</h1>

      <div className="prose prose-invert prose-sm max-w-none space-y-8 text-neutral-400 leading-relaxed">

        <section>
          <h2 className="font-serif text-xl font-bold text-white mb-3">1. Titolare del trattamento</h2>
          <p>
            Il titolare del trattamento dei dati personali è Antonio Moro, raggiungibile all&apos;indirizzo email{" "}
            <a href="mailto:amoro6321@gmail.com" className="text-accent hover:underline">amoro6321@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-white mb-3">2. Dati raccolti</h2>
          <p>In occasione degli acquisti sul sito raccogliamo i seguenti dati personali:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Nome e cognome</li>
            <li>Indirizzo email</li>
            <li>Indirizzo di spedizione</li>
            <li>Dati di pagamento (gestiti esclusivamente da Stripe — non archiviamo numeri di carta)</li>
          </ul>
          <p className="mt-3">
            Raccogliamo inoltre dati di navigazione anonimi tramite Google Analytics (indirizzo IP anonimizzato,
            pagine visitate, durata della sessione) per migliorare l&apos;esperienza utente.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-white mb-3">3. Finalità del trattamento</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Elaborazione e spedizione degli ordini</li>
            <li>Comunicazioni relative all&apos;ordine (conferma, tracking)</li>
            <li>Adempimenti fiscali e contabili</li>
            <li>Analisi statistica del traffico (Google Analytics)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-white mb-3">4. Base giuridica</h2>
          <p>
            Il trattamento dei dati è necessario per l&apos;esecuzione del contratto di vendita (art. 6 par. 1 lett. b GDPR).
            Per i cookie analitici la base giuridica è il consenso dell&apos;utente (art. 6 par. 1 lett. a GDPR).
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-white mb-3">5. Conservazione dei dati</h2>
          <p>
            I dati relativi agli ordini sono conservati per 10 anni in ottemperanza agli obblighi fiscali italiani.
            I dati analitici sono conservati per 26 mesi.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-white mb-3">6. Terze parti</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-white">Stripe</strong> — elaborazione pagamenti (USA, Privacy Shield)</li>
            <li><strong className="text-white">Supabase</strong> — database e storage (EU)</li>
            <li><strong className="text-white">Vercel</strong> — hosting (USA, Standard Contractual Clauses)</li>
            <li><strong className="text-white">Google Analytics</strong> — analisi statistiche (USA, SCCs)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-white mb-3">7. Diritti dell&apos;interessato</h2>
          <p>
            Hai il diritto di accedere, rettificare, cancellare i tuoi dati, opporti al trattamento e richiedere
            la portabilità. Puoi esercitare questi diritti scrivendo a{" "}
            <a href="mailto:amoro6321@gmail.com" className="text-accent hover:underline">amoro6321@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-white mb-3">8. Cookie</h2>
          <p>
            Il sito utilizza cookie tecnici necessari al funzionamento (carrello, sessione admin) e cookie analitici
            di Google Analytics, attivati solo previo consenso. Puoi revocare il consenso in qualsiasi momento
            cancellando i cookie dal browser.
          </p>
        </section>

        <section>
          <h2 className="font-serif text-xl font-bold text-white mb-3">9. Aggiornamenti</h2>
          <p>
            La presente policy può essere aggiornata. La versione vigente è sempre disponibile su questa pagina.
            Ultimo aggiornamento: giugno 2026.
          </p>
        </section>

      </div>
    </div>
  );
}
