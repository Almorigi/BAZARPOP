import Link from "next/link";
import { ArrowRight, Heart, Package, Star, Truck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chi Siamo — La Soffitta del Collezionista",
  description: "La storia di un appassionato di fumetti cresciuto tra le pagine di Topolino, Tex e Alan Ford. Scopri chi c'è dietro La Soffitta del Collezionista.",
};

const valori = [
  {
    icon: Heart,
    title: "Passione vera",
    desc: "Ogni oggetto in vendita è passato per le mie mani. So cosa significa custodire qualcosa con cura.",
  },
  {
    icon: Star,
    title: "Selezione accurata",
    desc: "Nessun prodotto viene messo in vendita senza una descrizione onesta delle sue condizioni reali.",
  },
  {
    icon: Truck,
    title: "Spedizione curata",
    desc: "Imballiamo ogni pacco come se lo stessimo spedendo a noi stessi. Fumetti protetti, sempre.",
  },
  {
    icon: Package,
    title: "Prezzi onesti",
    desc: "Non speculo sulle passioni altrui. I prezzi rispecchiano il valore reale di ogni pezzo.",
  },
];

export default function ChiSiamoPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-20">

      {/* Hero */}
      <div className="mb-16">
        <p className="text-xs tracking-[0.3em] uppercase text-accent mb-4">La nostra storia</p>
        <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white leading-tight mb-8">
          Una soffitta<br />
          <em className="gradient-text not-italic">piena di sogni</em>
        </h1>
        <div className="w-16 h-px bg-accent/40" />
      </div>

      {/* Storia */}
      <div className="grid md:grid-cols-5 gap-12 mb-20">
        <div className="md:col-span-3 space-y-6 text-neutral-400 text-base leading-relaxed">
          <p>
            Tutto è cominciato da bambino, con una copia di <strong className="text-white">Topolino</strong> comprata all'edicola sotto casa.
            Quella settimana non aspettavo altro — il martedì era il giorno più bello della settimana.
            Da lì è stata una discesa libera: <strong className="text-white">Tex</strong>, <strong className="text-white">Zagor</strong>,
            il <strong className="text-white">Comandante Mark</strong>, <strong className="text-white">Alan Ford</strong>,
            e poi i grandi eroi Marvel — <strong className="text-white">Spider-Man</strong>, <strong className="text-white">Doctor Strange</strong> —
            fino alle console retro e ai videogiochi che profumavano ancora di plastica nuova.
          </p>
          <p>
            Nel tempo ho accumulato centinaia di pezzi — scaffali pieni, scatole in cantina, qualche rimpianto
            per quelli ceduti troppo in fretta. Ogni oggetto porta con sé un ricordo preciso: dove ero,
            quanti anni avevo, quanto ci avevo messo a trovarlo.
          </p>
          <p>
            Oggi ho deciso di condividere questa collezione con chi la sa apprezzare davvero.
            Non è un magazzino — è una <strong className="text-white">soffitta</strong>, quella parte della casa
            dove si conservano le cose che contano. Ogni pezzo che trovi qui è stato amato almeno una volta.
            Tocca a te dargli una nuova storia.
          </p>
        </div>

        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="glass rounded-3xl p-6 border border-border">
            <div className="font-serif text-4xl font-bold text-accent mb-1">1000+</div>
            <div className="text-sm text-neutral-500">Pezzi selezionati a mano</div>
          </div>
          <div className="glass rounded-3xl p-6 border border-border">
            <div className="font-serif text-4xl font-bold text-accent mb-1">5</div>
            <div className="text-sm text-neutral-500">Categorie — fumetti, libri, videogiochi, dvd, oggetti</div>
          </div>
          <div className="glass rounded-3xl p-6 border border-border">
            <div className="font-serif text-4xl font-bold text-accent mb-1">∞</div>
            <div className="text-sm text-neutral-500">Anni di passione per il collezionismo</div>
          </div>
        </div>
      </div>

      {/* Valori */}
      <div className="mb-20">
        <p className="text-xs tracking-[0.3em] uppercase text-accent mb-4">Come lavoriamo</p>
        <h2 className="font-serif text-3xl font-bold text-white mb-10">I nostri valori</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {valori.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass rounded-2xl p-6 border border-border hover:border-accent/20 transition-colors">
              <Icon size={22} className="text-accent mb-4" />
              <h3 className="font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer legale */}
      <div className="mb-10 flex items-start gap-3 bg-white/3 border border-white/8 rounded-2xl px-5 py-4">
        <span className="text-neutral-600 mt-0.5 flex-shrink-0">ℹ️</span>
        <p className="text-xs text-neutral-500 leading-relaxed">
          Tutti gli articoli in vendita provengono dalla collezione personale del venditore e sono beni usati di proprietà privata. Non viene svolta attività professionale di commercio.
        </p>
      </div>

      {/* CTA */}
      <div className="text-center glass rounded-3xl p-10 border border-border">
        <p className="text-xs tracking-[0.3em] uppercase text-accent mb-4">Unisciti alla community</p>
        <h2 className="font-serif text-3xl font-bold text-white mb-4">
          Trova il tuo prossimo<br />oggetto del cuore
        </h2>
        <p className="text-neutral-500 mb-8 max-w-md mx-auto text-sm leading-relaxed">
          Sfoglia la collezione — chissà che non ci sia qualcosa che aspettava solo te.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-2xl transition-colors text-sm shadow-[0_0_30px_rgba(249,115,22,0.2)]"
          >
            Esplora la collezione <ArrowRight size={16} />
          </Link>
          <a
            href="mailto:amoro6321@gmail.com"
            className="inline-flex items-center gap-2 glass border border-border hover:border-accent/30 text-white font-semibold px-8 py-4 rounded-2xl transition-colors text-sm"
          >
            Scrivimi
          </a>
        </div>
      </div>
    </div>
  );
}
