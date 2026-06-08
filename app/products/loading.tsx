import { ProductGridSkeleton } from "@/components/ProductCardSkeleton";

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="mb-8">
        <div className="h-3 w-20 bg-surface-3 rounded-full mb-3 animate-pulse" />
        <div className="h-10 w-48 bg-surface-3 rounded-full animate-pulse" />
      </div>
      <div className="h-12 bg-surface-2 rounded-2xl mb-6 animate-pulse" />
      <div className="flex gap-2 mb-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 w-20 bg-surface-2 rounded-full animate-pulse" />
        ))}
      </div>
      <ProductGridSkeleton count={12} />
    </div>
  );
}
