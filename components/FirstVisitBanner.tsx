"use client";
import { useEffect, useState } from "react";
import { X, Tag } from "lucide-react";

export default function FirstVisitBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("soffitta_welcome_seen");
    if (!seen) {
      // Mostra dopo 3 secondi dalla prima visita
      const t = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  function dismiss() {
    localStorage.setItem("soffitta_welcome_seen", "1");
    setVisible(false);
  }

  function copyCode() {
    navigator.clipboard.writeText("BENVENUTO10").catch(() => {});
    dismiss();
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md animate-in slide-in-from-bottom-4 duration-500">
      <div className="glass border border-accent/30 rounded-2xl p-5 shadow-[0_8px_40px_rgba(249,115,22,0.2)]">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-neutral-600 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/15 border border-accent/20 flex items-center justify-center flex-shrink-0">
            <Tag size={18} className="text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm mb-0.5">Benvenuto in soffitta! 🎉</p>
            <p className="text-neutral-400 text-xs mb-3">
              Sul tuo primo ordine hai diritto a uno sconto del 10%. Usa il codice:
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-accent/10 border border-accent/30 rounded-xl px-3 py-2 text-accent font-mono font-bold text-sm tracking-widest text-center">
                BENVENUTO10
              </code>
              <button
                onClick={copyCode}
                className="bg-accent hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
              >
                Copia
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
