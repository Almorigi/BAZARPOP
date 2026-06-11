"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function ExitIntentPopup() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) return; // niente popup nell'area admin
    const dismissed = sessionStorage.getItem("soffitta_exit_dismissed");
    if (dismissed) return;

    function handleMouseLeave(e: MouseEvent) {
      // Mostra solo se il mouse esce dall'alto della pagina (verso tab/url bar)
      if (e.clientY <= 5) {
        setVisible(true);
        document.removeEventListener("mouseleave", handleMouseLeave);
      }
    }

    // Aspetta 10 secondi prima di attivare il trigger
    const t = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 10000);

    return () => {
      clearTimeout(t);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isAdmin]);

  function dismiss() {
    sessionStorage.setItem("soffitta_exit_dismissed", "1");
    setVisible(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), source: "exit_intent" }),
    }).catch(() => {});
    setLoading(false);
    setDone(true);
    // Imposta anche il banner benvenuto come visto così non si duplicano
    localStorage.setItem("soffitta_welcome_seen", "1");
    setTimeout(dismiss, 3000);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md glass border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-300">
        <button onClick={dismiss} className="absolute top-4 right-4 text-neutral-600 hover:text-white transition-colors">
          <X size={18} />
        </button>

        {!done ? (
          <>
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">📦</div>
              <h2 className="font-serif text-2xl font-bold text-white mb-2">Aspetta un secondo!</h2>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Iscriviti alla newsletter e ricevi in anteprima i <strong className="text-white">nuovi arrivi</strong> ogni settimana. Niente spam, solo pezzi da collezione.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="La tua email"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-orange-500/50 transition-colors"
                style={{ colorScheme: "dark" }}
              />
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold py-3.5 rounded-2xl transition-colors disabled:opacity-60"
              >
                {loading
                  ? <Loader2 size={16} className="animate-spin" />
                  : <><Mail size={16} /> Iscrivimi ai nuovi arrivi <ArrowRight size={14} /></>
                }
              </button>
            </form>

            <div className="mt-3 text-center">
              <button onClick={dismiss} className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors">
                No grazie, continuo senza
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">✅</div>
            <h2 className="font-serif text-xl font-bold text-white mb-2">Sei dentro!</h2>
            <p className="text-neutral-400 text-sm">
              Ti avviseremo ogni volta che arrivano nuovi pezzi in soffitta. A presto!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
