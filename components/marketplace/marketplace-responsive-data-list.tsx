import type { ReactNode } from "react";

import { MARKETPLACE_MOBILE_CARD_CLASS } from "@/lib/marketplace/mobile-ui";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type MarketplaceResponsiveColumn<T> = {
  key: string;
  header: string;
  className?: string;
  cell: (row: T) => ReactNode;
  hideOnMobile?: boolean;
};

export function MarketplaceResponsiveDataList<T extends { id: string }>({
  rows,
  columns,
  renderMobileCard,
  emptyMessage = "No rows to display.",
}: {
  rows: T[];
  columns: MarketplaceResponsiveColumn<T>[];
  renderMobileCard: (row: T) => ReactNode;
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className={cn(MARKETPLACE_MOBILE_CARD_CLASS, "py-10 text-center text-sm text-muted-foreground")}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 lg:hidden">
        {rows.map((row) => (
          <div key={row.id} className={MARKETPLACE_MOBILE_CARD_CLASS}>
            {renderMobileCard(row)}
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-border/80 bg-card/80 shadow-sm lg:block">
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
    </>
  );
}
