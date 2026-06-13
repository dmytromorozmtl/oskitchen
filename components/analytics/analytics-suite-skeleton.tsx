import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { SKELETON_SURFACE_CLASS } from "@/lib/design/loading-skeleton-patterns";
import { cn } from "@/lib/utils";

/** Analytics suite metric grid — revenue, orders, ops tiles (DES-28 wave 1). */
export function AnalyticsSuiteSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("space-y-6", className)}
      data-testid="analytics-suite-skeleton"
      aria-busy="true"
      aria-label="Loading analytics suite"
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingSkeleton
            key={index}
            className={cn("h-28 w-full rounded-xl border", SKELETON_SURFACE_CLASS)}
          />
        ))}
      </div>
      <div className={cn("space-y-3 rounded-xl border p-4", SKELETON_SURFACE_CLASS)}>
        <LoadingSkeleton className="h-6 w-40" />
        <LoadingSkeleton className="h-64 w-full rounded-lg" />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <LoadingSkeleton className={cn("h-48 w-full rounded-xl border", SKELETON_SURFACE_CLASS)} />
        <LoadingSkeleton className={cn("h-48 w-full rounded-xl border", SKELETON_SURFACE_CLASS)} />
      </div>
    </div>
  );
}
