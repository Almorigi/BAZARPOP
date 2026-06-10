import Link from "next/link";
import { ShieldCheck, Truck, CreditCard } from "lucide-react";

const categories = [
  { href: "/products?category=fumetti",     label: "Fumetti" },
  { href: "/products?category=libri",       label: "Libri" },
  { href: "/products?category=videogiochi", label: "Videogiochi" },
  { href: "/products?category=dvd",         label: "Film DVD" },
  { href: "/products?category=oggetti",     label: "Oggetti Vari" },
];

const trust = [
  { icon: ShieldCheck, label: "Pagamenti sicuri con Stripe" },
  { icon: Truck,       label: "Spedizione tracciata in Italia" },
  { icon: CreditCard,  label: "Rimborso garantito 14 giorni" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#080808]">

      {/* Trust bar */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {trust.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 text-sm text-neutral-500">
              <Icon size={16} className="text-accent flex-shrink-0" />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <div className="font-serif text-2xl font-bold text-white tracking-wide">La Soffitta</div>
              <div className="text-[10px] tracking-[0.3em] uppercase text-accent font-medium">del Collezionista</div>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed max-w-xs">
              Fumetti, libri, videogiochi, film DVD e oggetti unici selezionati con cura. Ogni pezzo ha la sua storia.
            </p>
          </div>

          {/* Categories */}
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-neutral-600 mb-5">Categorie</p>
            <ul className="flex flex-col gap-3">
              {categories.map((c) => (
                <li key={c.href}>
                  <Link href={c.href} className="text-sm text-neutral-500 hover:text-white transition-colors hover-underline">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-neutral-600 mb-5">Negozio</p>
            <ul className="flex flex-col gap-3">
              {[
                { href: "/products",  label: "Tutti i prodotti" },
                { href: "/box",       label: "Box Misteriose 🎁" },
                { href: "/cart",      label: "Carrello" },
                { href: "/ordine",    label: "Traccia ordine" },
                { href: "/reso",      label: "Richiedi un reso" },
                { href: "/punti",     label: "Punti fedeltà" },
                { href: "/chi-siamo", label: "Chi siamo" },
                { href: "/contatti",  label: "Contatti & FAQ" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-neutral-500 hover:text-white transition-colors hover-underline">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="mailto:amoro6321@gmail.com" className="text-sm text-neutral-500 hover:text-white transition-colors hover-underline">
                  amoro6321@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Legale */}
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-neutral-600 mb-5">Legale</p>
            <ul className="flex flex-col gap-3">
              {[
                { href: "/privacy",  label: "Privacy Policy" },
                { href: "/termini",  label: "Termini e Condizioni" },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-neutral-500 hover:text-white transition-colors hover-underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-white/5 pt-8 mb-6">
          <p className="text-xs text-neutral-700 leading-relaxed text-center max-w-2xl mx-auto">
            Tutti gli articoli in vendita provengono dalla collezione personale del venditore e sono beni usati di proprietà privata. Non viene svolta attività professionale di commercio.
          </p>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-700">
            © {new Date().getFullYear()} La Soffitta del Collezionista. Tutti i diritti riservati.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="text-xs text-neutral-700 hover:text-neutral-500 transition-colors">
              Privacy
            </Link>
            <Link href="/termini" className="text-xs text-neutral-700 hover:text-neutral-500 transition-colors">
              Termini
            </Link>
            <span className="text-xs text-neutral-700">
              Pagamenti sicuri con <span className="text-neutral-500 font-medium">Stripe</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
