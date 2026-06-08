"use client";
import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <p className="font-serif text-[120px] font-bold leading-none text-red-500/40 mb-2">500</p>
      <h1 className="font-serif text-2xl font-bold text-white mb-3">Qualcosa è andato storto</h1>
      <p className="text-neutral-500 max-w-sm mb-10 text-sm leading-relaxed">
        Si è verificato un errore inaspettato. Riprova tra qualche secondo.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button onClick={reset}
          className="flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-2xl transition-colors text-sm">
          <RefreshCw size={15} /> Riprova
        </button>
        <Link href="/"
          className="flex items-center gap-2 glass border border-border hover:bg-white/5 text-white font-medium px-6 py-3 rounded-2xl transition-colors text-sm">
          <Home size={15} /> Home
        </Link>
      </div>
    </div>
  );
}
