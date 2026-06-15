import { cn } from "@/lib/utils";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { SKELETON_SURFACE_CLASS } from "@/lib/design/loading-skeleton-patterns";

export type POSSkeletonSection = "hub" | "register";

/** POS hub / register layout — category rail, menu grid, cart (DES-28). */
export function POSSkeleton({
  section = "hub",
  className,
}: {
  section?: POSSkeletonSection;
  className?: string;
}) {
  if (section === "register") {
    return (
      <div
        className={cn(
          "grid min-h-[480px] gap-3 lg:grid-cols-[minmax(0,1fr)_320px]",
          className,
        )}
        data-testid="pos-skeleton-register"
        aria-busy="true"
        aria-label="Loading POS register"
      >
        <div className={cn("flex min-h-[420px] flex-col gap-3 rounded-xl border p-3", SKELETON_SURFACE_CLASS)}>
          <LoadingSkeleton className="h-10 w-full max-w-md" />
          <div className="grid flex-1 grid-cols-3 gap-2 sm:grid-cols-4">
            {Array.from({ length: 12 }).map((_, index) => (
              <LoadingSkeleton key={index} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </div>
        <div className={cn("space-y-3 rounded-xl border p-3", SKELETON_SURFACE_CLASS)}>
          <LoadingSkeleton className="h-6 w-24" />
          <LoadingSkeleton className="h-32 w-full" />
          <LoadingSkeleton className="h-11 w-full rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("space-y-6", className)}
      data-testid="pos-skeleton"
      aria-busy="true"
      aria-label="Loading POS"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <LoadingSkeleton className="h-9 w-48" />
        <div className="flex gap-2">
          <LoadingSkeleton className="h-10 w-28 rounded-full" />
          <LoadingSkeleton className="h-10 w-28 rounded-full" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <LoadingSkeleton key={index} className="h-28 w-full rounded-xl border border-border/60" />
        ))}
      </div>
    </div>
  );
}
