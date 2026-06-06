"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Cookie } from "lucide-react";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      // Piccolo delay per non mostrarlo subito al caricamento
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  function accept() {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
    // Se vuoi attivare GA solo dopo il consenso, ricarica la pagina
    // window.location.reload();
  }

  function decline() {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-[100] animate-fade-up">
      <div className="glass border border-white/10 rounded-2xl p-5 shadow-[0_8px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl bg-[#0e0e0e]/95">
        <div className="flex items-start gap-3 mb-4">
          <Cookie size={18} className="text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-white mb-1">Questo sito usa i cookie</p>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Utilizziamo cookie tecnici essenziali e cookie analitici (Google Analytics) per migliorare l&apos;esperienza
              di navigazione. Leggi la nostra{" "}
              <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
            </p>
          </div>
          <button onClick={decline} className="flex-shrink-0 text-neutral-600 hover:text-white transition-colors ml-auto">
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={decline}
            className="flex-1 text-xs font-medium text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2.5 rounded-xl transition-colors"
          >
            Solo necessari
          </button>
          <button
            onClick={accept}
            className="flex-1 text-xs font-bold text-white bg-accent hover:bg-orange-600 px-4 py-2.5 rounded-xl transition-colors"
          >
            Accetta tutti
          </button>
        </div>
      </div>
    </div>
  );
}
