import { Zap } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-surface-800 border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row gap-6 items-start justify-between">
        <div>
          <div className="flex items-center gap-2 font-extrabold text-xl mb-2">
            <Zap className="text-brand-500" size={20} />
            <span className="text-white">Soffitta<span className="text-brand-500">del Collezionista</span></span>
          </div>
          <p className="text-sm text-gray-500 max-w-xs">
            Fumetti, libri, videogiochi e molto altro. Tutto usato con cura, spedito velocemente.
          </p>
        </div>
        <div className="flex flex-wrap gap-8 text-sm text-gray-400">
          <div className="flex flex-col gap-2">
            <span className="text-white font-semibold">Categorie</span>
            <Link href="/products?category=fumetti" className="hover:text-white">Fumetti</Link>
            <Link href="/products?category=libri" className="hover:text-white">Libri</Link>
            <Link href="/products?category=videogiochi" className="hover:text-white">Videogiochi</Link>
            <Link href="/products?category=oggetti" className="hover:text-white">Oggetti</Link>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-white font-semibold">Info</span>
            <Link href="/products" className="hover:text-white">Tutti i prodotti</Link>
            <Link href="/cart" className="hover:text-white">Carrello</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 py-4 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} La Soffitta del Collezionista. Tutti i diritti riservati.
      </div>
    </footer>
  );
}
