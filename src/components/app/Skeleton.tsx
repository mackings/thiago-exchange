export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-cream-300/70 ${className}`} />;
}

export function OfferRowSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-4 w-20 rounded-full" />
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </div>
  );
}
