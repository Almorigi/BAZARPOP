"use client";
import { useEffect } from "react";
import { clearCart } from "@/lib/cart";
import { CheckCircle, Package, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

export default function SuccessPage() {
  useEffect(() => {
    clearCart();
    // Confetti burst
    const fire = (particleRatio: number, opts: confetti.Options) => {
      confetti({ origin: { y: 0.7 }, ...opts, particleCount: Math.floor(200 * particleRatio) });
    };
    fire(0.25, { spread: 26, startVelocity: 55, colors: ["#f97316", "#fb923c"] });
    fire(0.2, { spread: 60, colors: ["#ffffff", "#f97316"] });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8, colors: ["#f97316", "#fbbf24"] });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-24">

      {/* Icona animata */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center">
          <CheckCircle size={48} className="text-emerald-400" />
        </div>
        <div className="absolute inset-0 rounded-full bg-emerald-400/5 animate-ping" />
      </div>

      <p className="text-xs tracking-[0.3em] uppercase text-accent mb-3">Acquisto completato</p>
      <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4 text-center">
        Ordine confermato!
      </h1>
      <p className="text-neutral-400 max-w-sm text-center leading-relaxed mb-10">
        Grazie per il tuo acquisto. Riceverai a breve una <strong className="text-white">email di conferma</strong> con il riepilogo e il link per tracciare la spedizione.
      </p>

      {/* Info box */}
      <div className="w-full max-w-md bg-surface-2 border border-border rounded-2xl p-6 mb-8 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
            <Mail size={16} className="text-accent" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold">Controlla la tua email</p>
            <p className="text-neutral-500 text-xs mt-0.5">Ti abbiamo inviato la ricevuta con il riepilogo dell&apos;ordine.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
            <Package size={16} className="text-accent" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold">Preparazione in corso</p>
            <p className="text-neutral-500 text-xs mt-0.5">Riceverai un&apos;altra email con il codice di tracciamento non appena il pacco viene spedito.</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/products"
          className="flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-2xl transition-colors text-sm shadow-[0_0_30px_rgba(249,115,22,0.2)]">
          Continua a sfogliare <ArrowRight size={16} />
        </Link>
        <Link href="/"
          className="flex items-center gap-2 glass border border-border hover:border-accent/30 text-white font-semibold px-8 py-4 rounded-2xl transition-colors text-sm">
          Torna alla home
        </Link>
      </div>
    </div>
  );
}
