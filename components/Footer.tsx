import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const categories = [
  { href: "/products?category=fumetti",     label: "Fumetti" },
  { href: "/products?category=libri",       label: "Libri" },
  { href: "/products?category=videogiochi", label: "Videogiochi" },
  { href: "/products?category=oggetti",     label: "Oggetti Vari" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#080808]">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">

          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <div className="font-serif text-2xl font-bold text-white tracking-wide">La Soffitta</div>
              <div className="text-[10px] tracking-[0.3em] uppercase text-accent font-medium">del Collezionista</div>
            </div>
            <p className="text-sm text-neutral-600 leading-relaxed max-w-xs">
              Fumetti, libri, videogiochi e oggetti unici selezionati con cura. Ogni pezzo ha la sua storia.
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
                { href: "/products", label: "Tutti i prodotti" },
                { href: "/cart",     label: "Carrello" },
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

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-700">
            © {new Date().getFullYear()} La Soffitta del Collezionista. Tutti i diritti riservati.
          </p>
          <div className="flex items-center gap-1 text-xs text-neutral-700">
            <span>Pagamenti sicuri con</span>
            <span className="text-neutral-500 font-medium ml-1">Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
