"use client";
import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(249,115,22,0.12),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]" />

      <div className="relative z-10 max-w-lg">
        {/* Logo */}
        <div className="mb-10">
          <div className="font-serif text-3xl font-bold text-white tracking-wide">La Soffitta</div>
          <div className="text-[11px] tracking-[0.3em] uppercase text-accent font-medium">del Collezionista</div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 glass rounded-full px-5 py-2 text-xs font-medium text-accent tracking-widest uppercase mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          In arrivo
        </div>

        {/* Headline */}
        <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
          Stiamo<br />
          <em className="gradient-text not-italic">preparando</em><br />
          tutto
        </h1>

        <p className="text-neutral-400 text-lg leading-relaxed mb-10">
          Fumetti, libri, videogiochi, film DVD e oggetti unici.<br />
          Torna presto — ne varrà la pena.
        </p>

        {/* Email form */}
        {!sent ? (
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="La tua email"
              className="flex-1 bg-[#161616] border border-white/10 rounded-2xl px-5 py-3.5 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-accent/40 transition-colors"
              style={{ colorScheme: "dark" }}
            />
            <button
              onClick={() => { if (email) setSent(true); }}
              className="flex items-center justify-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold px-6 py-3.5 rounded-2xl transition-colors text-sm whitespace-nowrap shadow-[0_0_20px_rgba(249,115,22,0.3)]"
            >
              <Mail size={15} /> Avvisami
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-medium">
            <CheckCircle size={20} /> Grazie! Ti avviseremo all'apertura.
          </div>
        )}

        <p className="text-neutral-700 text-xs mt-6">
          © {new Date().getFullYear()} La Soffitta del Collezionista
        </p>
      </div>
    </div>
  );
}
