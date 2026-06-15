import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSkeleton } from "@/components/feedback/loading-skeleton";
import { cn } from "@/lib/utils";

/** Skeleton rows for dashboard data tables while `loading` or route transitions. */
export function TableSkeletonRows({
  columns,
  rows = 8,
  className,
}: {
  columns: number;
  rows?: number;
  className?: string;
}) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <TableRow key={rowIdx} className={cn("border-border/60", className)}>
          {Array.from({ length: columns }).map((__, colIdx) => (
            <TableCell key={colIdx}>
              <LoadingSkeleton
                className={cn(
                  "h-4",
                  colIdx === 0 ? "w-3/4" : colIdx === columns - 1 ? "w-16 ml-auto" : "w-full",
                )}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function TableSkeleton({
  columns,
  columnLabels,
  rows = 8,
  className,
}: {
  columns: number;
  columnLabels?: string[];
  rows?: number;
  className?: string;
}) {
  const labels =
    columnLabels ??
    Array.from({ length: columns }).map((_, i) => (i === 0 ? "Loading…" : ""));

  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-border/80", className)} aria-busy aria-label="Loading table">
      <Table>
        <TableHeader>
          <TableRow>
            {labels.map((label, i) => (
              <TableHead key={i}>{label === "Loading…" ? <LoadingSkeleton className="h-4 w-24" /> : label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableSkeletonRows columns={columns} rows={rows} />
        </TableBody>
      </Table>
    </div>
  );
}
