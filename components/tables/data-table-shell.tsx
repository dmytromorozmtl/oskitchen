import type { ReactNode } from "react";

import { TableSkeleton } from "@/components/tables/table-skeleton";
import {
  TABLE_CARD_SHELL_CLASS,
  TABLE_CARD_SHELL_TEST_ID,
} from "@/lib/design/table-card-patterns";
import { cn } from "@/lib/utils";

export function DataTableShell({
  toolbar,
  children,
  className,
  loading,
  skeletonColumns = 5,
  skeletonRows = 8,
  skeletonLabels,
}: {
  toolbar?: ReactNode;
  children: ReactNode;
  className?: string;
  loading?: boolean;
  skeletonColumns?: number;
  skeletonRows?: number;
  skeletonLabels?: string[];
}) {
  return (
    <div className={cn("space-y-4", className)} data-testid={TABLE_CARD_SHELL_TEST_ID}>
      {toolbar ? <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">{toolbar}</div> : null}
      {loading ? (
        <TableSkeleton columns={skeletonColumns} rows={skeletonRows} columnLabels={skeletonLabels} />
      ) : (
        <div className={TABLE_CARD_SHELL_CLASS}>{children}</div>
      )}
    </div>
  );
}
