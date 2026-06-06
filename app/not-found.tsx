import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      {/* Decorative number */}
      <div className="relative mb-8">
        <div className="font-serif text-[180px] md:text-[240px] font-bold leading-none select-none"
          style={{
            background: "linear-gradient(180deg, rgba(249,115,22,0.15) 0%, rgba(249,115,22,0.02) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Search size={32} className="text-accent" />
          </div>
        </div>
      </div>

      <p className="text-xs tracking-[0.3em] uppercase text-accent mb-4">Pagina non trovata</p>
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
        Questo oggetto non è in soffitta
      </h1>
      <p className="text-neutral-500 max-w-sm mb-10 leading-relaxed">
        La pagina che cerchi non esiste o è stata spostata. Prova a esplorare la collezione.
      </p>

      <div className="flex flex-wrap gap-4 justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Torna alla home
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-2xl transition-colors text-sm"
        >
          Esplora la collezione
        </Link>
      </div>
    </div>
  );
}
