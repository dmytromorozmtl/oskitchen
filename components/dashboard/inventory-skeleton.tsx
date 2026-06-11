import { cn } from "@/lib/utils";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SKELETON_SURFACE_CLASS } from "@/lib/design/loading-skeleton-patterns";

/** Inventory hub — KPI tiles, stock table, alerts (DES-28 / P1-23). */
export function InventorySkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("space-y-6", className)}
      data-testid="inventory-skeleton"
      aria-busy="true"
      aria-label="Loading inventory"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LoadingSkeleton className="h-9 w-52" />
        <LoadingSkeleton className="h-10 w-36 rounded-full" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingSkeleton key={index} className="h-24 w-full rounded-xl border border-border/60" />
        ))}
      </div>

      <Card className={cn(SKELETON_SURFACE_CLASS, "shadow-sm")}>
        <CardHeader className="space-y-2">
          <LoadingSkeleton className="h-6 w-44" />
          <LoadingSkeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-12 w-full rounded-lg" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
