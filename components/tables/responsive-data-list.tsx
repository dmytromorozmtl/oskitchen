import type { ReactNode } from "react";

import { EmptyState, type EmptyStateProps } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TABLE_CARD_SHELL_TEST_ID,
  TABLE_MOBILE_CARD_CLASS,
} from "@/lib/design/table-card-patterns";
import { cn } from "@/lib/utils";

export type ResponsiveDataColumn<T> = {
  key: string;
  header: string;
  className?: string;
  cell: (row: T) => ReactNode;
  hideOnMobile?: boolean;
};

export function ResponsiveDataList<T extends { id: string }>({
  rows,
  columns,
  renderMobileCard,
  emptyMessage = "No rows to display.",
  emptyState,
  mobileCardClassName,
  tableShellClassName,
}: {
  rows: T[];
  columns: ResponsiveDataColumn<T>[];
  renderMobileCard: (row: T) => ReactNode;
  emptyMessage?: string;
  emptyState?: Pick<
    EmptyStateProps,
    | "icon"
    | "title"
    | "description"
    | "primaryLabel"
    | "primaryHref"
    | "secondaryLabel"
    | "secondaryHref"
  >;
  mobileCardClassName?: string;
  tableShellClassName?: string;
}) {
  const mobileCardClass = cn(TABLE_MOBILE_CARD_CLASS, mobileCardClassName);
  const tableShellClass = cn(
    "hidden overflow-hidden rounded-2xl border border-border/80 bg-card/80 shadow-sm lg:block",
    tableShellClassName,
  );

  if (rows.length === 0) {
    if (emptyState) {
      return (
        <EmptyState
          {...emptyState}
          variant="inline"
          showDemoLink={false}
          className={mobileCardClass}
        />
      );
    }

    return (
      <div className={cn(mobileCardClass, "py-10 text-center text-sm text-muted-foreground")}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div data-testid={`${TABLE_CARD_SHELL_TEST_ID}-responsive`}>
      <div className="space-y-3 lg:hidden">
        {rows.map((row) => (
          <div key={row.id} className={mobileCardClass}>
            {renderMobileCard(row)}
          </div>
        ))}
      </div>

      <div className={tableShellClass}>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
