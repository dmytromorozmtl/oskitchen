import { cn } from "@/lib/utils";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SKELETON_SURFACE_CLASS } from "@/lib/design/loading-skeleton-patterns";

export type KDSSkeletonSection = "board" | "production";

/** Kitchen display — ticket columns and station cards (DES-28). */
export function KDSSkeleton({
  section = "board",
  className,
}: {
  section?: KDSSkeletonSection;
  className?: string;
}) {
  if (section === "production") {
    return (
      <div
        className={cn("space-y-4", className)}
        data-testid="kds-skeleton-production"
        aria-busy="true"
        aria-label="Loading KDS production view"
      >
        <LoadingSkeleton className="h-8 w-56" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-36 w-full rounded-xl border border-border/60" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("space-y-4", className)}
      data-testid="kds-skeleton"
      aria-busy="true"
      aria-label="Loading kitchen display"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LoadingSkeleton className="h-9 w-44" />
        <LoadingSkeleton className="h-9 w-32 rounded-full" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, columnIndex) => (
          <Card key={columnIndex} className={cn(SKELETON_SURFACE_CLASS, "shadow-sm")}>
            <CardHeader className="pb-2">
              <LoadingSkeleton className="h-5 w-28" />
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from({ length: 3 }).map((_, ticketIndex) => (
                <LoadingSkeleton key={ticketIndex} className="h-24 w-full rounded-lg" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
