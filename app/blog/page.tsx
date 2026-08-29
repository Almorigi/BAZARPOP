import Link from "next/link";
import type { Metadata } from "next";
import { posts } from "./posts";
import { ArrowRight, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — La Soffitta del Collezionista",
  description: "Guide, curiosità e approfondimenti sul mondo del collezionismo: fumetti Bonelli, Tex, Zagor, Dampyr e molto altro.",
  alternates: { canonical: "https://www.lasoffittadelcollezionista.it/blog" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
}

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-20">
      <div className="mb-14">
        <p className="text-xs tracking-[0.3em] uppercase text-accent mb-4">Articoli & Guide</p>
        <h1 className="font-serif text-5xl sm:text-6xl font-bold text-white leading-tight mb-4">
          Il nostro <em className="gradient-text not-italic">blog</em>
        </h1>
        <p className="text-neutral-500 text-base max-w-xl">
          Approfondimenti sul collezionismo, guide sui personaggi Bonelli e consigli per chi ama i fumetti.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`}
            className="group glass border border-border hover:border-accent/30 rounded-3xl p-7 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-semibold text-accent uppercase tracking-widest">{post.category}</span>
              <span className="text-neutral-700">·</span>
              <span className="text-xs text-neutral-600 flex items-center gap-1">
                <Clock size={11} /> {post.readTime} min
              </span>
              <span className="text-neutral-700">·</span>
              <span className="text-xs text-neutral-600">{formatDate(post.date)}</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-white mb-2 group-hover:text-accent transition-colors leading-snug">
              {post.title}
            </h2>
            <p className="text-neutral-500 text-sm leading-relaxed mb-4">{post.excerpt}</p>
            <span className="inline-flex items-center gap-1 text-accent text-sm font-semibold group-hover:gap-2 transition-all">
              Leggi l&apos;articolo <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
