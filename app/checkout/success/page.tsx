"use client";
import { useEffect } from "react";
import { clearCart } from "@/lib/cart";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  useEffect(() => { clearCart(); }, []);

  return (
    <div className="max-w-lg mx-auto px-4 py-24 text-center">
      <CheckCircle size={80} className="text-emerald-400 mx-auto mb-6" />
      <h1 className="text-3xl font-extrabold text-white mb-3">Ordine confermato!</h1>
      <p className="text-gray-400 mb-8">
        Grazie per il tuo acquisto. Riceverai una email di conferma a breve con i dettagli della spedizione.
      </p>
      <Link href="/products" className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-3 rounded-xl inline-block transition-colors">
        Continua a fare acquisti
      </Link>
    </div>
  );
}
