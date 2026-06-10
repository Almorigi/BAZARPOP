export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import Link from "next/link";
import { Gift, Sparkles, Package, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";

export const metadata: Metadata = {
  title: "Box Misteriose — La Soffitta del Collezionista",
  description: "Box sorpresa di fumetti, libri, DVD e oggetti da collezione selezionati a mano. Un piccolo tesoro a scatola chiusa.",
};

async function getBoxes(): Promise<Product[]> {
  const { data } = await supabase
    .from("products")
    .select("*")
    .ilike("title", "box misteriosa%")
    .eq("sold", false)
    .gt("stock", 0)
    .order("price", { ascending: true });
  return data ?? [];
}

const steps = [
  { icon: Gift, title: "Scegli la box", desc: "Ogni box ha un tema e un numero di pezzi garantito. Il contenuto? Sorpresa." },
  { icon: Sparkles, title: "Io seleziono", desc: "Scelgo personalmente i pezzi dalla collezione: il valore è sempre superiore al prezzo della box." },
  { icon: Package, title: "Apri e scopri", desc: "Ricevi il pacco e vivi l'emozione dell'unboxing. Nessuna box è uguale a un'altra." },
];

export default async function BoxPage() {
  const boxes = await getBoxes();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20">

      {/* Hero */}
      <div className="text-center mb-16">
        <p className="text-xs tracking-[0.3em] uppercase text-accent mb-4">L&apos;emozione della sorpresa</p>
        <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
          Box <em className="gradient-text not-italic">Misteriose</em>
        </h1>
        <p className="text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Un piccolo tesoro a scatola chiusa: pezzi selezionati a mano dalla collezione,
          con un valore sempre superiore al prezzo che paghi. Perfette anche da regalare.
        </p>
      </div>

      {/* Come funziona */}
      <div className="grid sm:grid-cols-3 gap-4 mb-16">
        {steps.map(({ icon: Icon, title, desc }, i) => (
          <div key={title} className="glass rounded-2xl p-6 border border-border relative overflow-hidden">
            <span className="absolute top-4 right-5 font-serif text-5xl font-bold text-white/5">{i + 1}</span>
            <Icon size={22} className="text-accent mb-4" />
            <h3 className="font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Box disponibili */}
      {boxes.length === 0 ? (
        <div className="text-center py-16 glass rounded-3xl border border-border">
          <span className="text-5xl block mb-4">🎁</span>
          <h2 className="font-serif text-2xl font-bold text-white mb-3">Box in preparazione!</h2>
          <p className="text-neutral-500 max-w-sm mx-auto mb-8 text-sm">
            Sto preparando le prossime box misteriose. Iscriviti alla newsletter per sapere quando saranno disponibili.
          </p>
          <Link href="/products" className="inline-flex items-center gap-2 bg-accent hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-2xl transition-colors text-sm">
            Esplora la collezione <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          <h2 className="font-serif text-3xl font-bold text-white mb-8">Box disponibili</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {boxes.map((b) => <ProductCard key={b.id} product={b} />)}
          </div>
        </>
      )}

      {/* Nota trasparenza */}
      <p className="text-xs text-neutral-600 text-center mt-12 max-w-lg mx-auto">
        Il contenuto delle box è a sorpresa e non è possibile richiedere pezzi specifici.
        Le condizioni dei singoli articoli rispecchiano gli standard del negozio (da Discreto a Nuovo).
      </p>
    </div>
  );
}
