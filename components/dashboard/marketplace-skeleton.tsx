import { cn } from "@/lib/utils";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SKELETON_SURFACE_CLASS } from "@/lib/design/loading-skeleton-patterns";

/** B2B marketplace hub — hero, metrics, vendor/product grids (DES-28). */
export function MarketplaceSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("space-y-6", className)}
      data-testid="marketplace-skeleton"
      aria-busy="true"
      aria-label="Loading marketplace"
    >
      <LoadingSkeleton className="h-36 w-full rounded-2xl" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <LoadingSkeleton className="h-10 w-full max-w-xl" />
        <LoadingSkeleton className="h-10 w-32 shrink-0 rounded-full" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingSkeleton key={index} className="h-24 w-full" />
        ))}
      </div>

      <Card className={cn(SKELETON_SURFACE_CLASS, "shadow-sm")}>
        <CardHeader className="space-y-2">
          <LoadingSkeleton className="h-6 w-40" />
          <LoadingSkeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <LoadingSkeleton key={index} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
