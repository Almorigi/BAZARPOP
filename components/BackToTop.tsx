"use client";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-24 right-6 z-40 w-10 h-10 flex items-center justify-center bg-[#1e1e1e] hover:bg-[#2a2a2a] border border-white/10 text-neutral-400 hover:text-white rounded-full shadow-lg transition-all hover:scale-110"
      aria-label="Torna su"
    >
      <ArrowUp size={16} />
    </button>
  );
}
