import { cn } from "@/lib/utils";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  SKELETON_DESIGN_SYSTEM_DEFAULTS,
  SKELETON_DESIGN_SYSTEM_TEST_IDS,
} from "@/lib/design/skeleton-design-system-policy";
import {
  SKELETON_SURFACE_CLASS,
} from "@/lib/design/loading-skeleton-patterns";
import { TableSkeleton } from "@/components/tables/table-skeleton";

export { TableSkeleton };

function gridColumnClass(columns: number): string {
  if (columns <= 1) return "grid-cols-1";
  if (columns === 2) return "grid-cols-1 sm:grid-cols-2";
  if (columns === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
}

/** Card grid placeholder for catalog, marketplace, and list dashboards. */
export function CardGridSkeleton({
  count = SKELETON_DESIGN_SYSTEM_DEFAULTS.cardGridCount,
  columns = SKELETON_DESIGN_SYSTEM_DEFAULTS.cardGridColumns,
  className,
}: {
  count?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("grid gap-4", gridColumnClass(columns), className)}
      data-testid={SKELETON_DESIGN_SYSTEM_TEST_IDS.cardGrid}
      aria-busy="true"
      aria-label="Loading cards"
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className={cn(SKELETON_SURFACE_CLASS, "shadow-sm")}>
          <CardHeader className="space-y-2 pb-2">
            <LoadingSkeleton className="h-5 w-2/3" />
            <LoadingSkeleton className="h-3 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-2">
            <LoadingSkeleton className="h-24 w-full rounded-lg" />
            <LoadingSkeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** KPI strip placeholder for Today, analytics, and command center tiles. */
export function KPISkeleton({
  count = SKELETON_DESIGN_SYSTEM_DEFAULTS.kpiCount,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("grid grid-cols-2 gap-3 sm:grid-cols-4", className)}
      data-testid={SKELETON_DESIGN_SYSTEM_TEST_IDS.kpi}
      aria-busy="true"
      aria-label="Loading KPIs"
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className={cn(SKELETON_SURFACE_CLASS, "shadow-sm")}>
          <CardContent className="space-y-2 p-4">
            <LoadingSkeleton className="h-3 w-16" />
            <LoadingSkeleton className="h-8 w-20" />
            <LoadingSkeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** Chart panel placeholder for analytics and reporting routes. */
export function ChartSkeleton({
  height = SKELETON_DESIGN_SYSTEM_DEFAULTS.chartHeightPx,
  className,
}: {
  height?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        SKELETON_SURFACE_CLASS,
        "space-y-4 rounded-2xl border p-4 shadow-sm",
        className,
      )}
      data-testid={SKELETON_DESIGN_SYSTEM_TEST_IDS.chart}
      aria-busy="true"
      aria-label="Loading chart"
    >
      <LoadingSkeleton className="h-8 w-48" />
      <LoadingSkeleton className="w-full rounded-xl" style={{ height }} />
      <div className="grid gap-3 sm:grid-cols-2">
        <LoadingSkeleton className="h-16 rounded-lg" />
        <LoadingSkeleton className="h-16 rounded-lg" />
      </div>
    </div>
  );
}
