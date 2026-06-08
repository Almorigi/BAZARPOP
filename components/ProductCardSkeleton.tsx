export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col bg-surface-2 rounded-2xl overflow-hidden border border-border animate-pulse">
      <div className="aspect-[3/4] bg-surface-3" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-3.5 bg-surface-3 rounded-full w-full" />
        <div className="h-3 bg-surface-3 rounded-full w-2/3" />
        <div className="flex justify-between items-center mt-1">
          <div className="h-5 bg-surface-3 rounded-full w-14" />
          <div className="h-8 bg-surface-3 rounded-xl w-24" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
