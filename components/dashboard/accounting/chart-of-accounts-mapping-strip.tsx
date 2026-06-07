import Link from "next/link";
import { BookMarked } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CHART_OF_ACCOUNTS_MAPPING_ROUTE } from "@/lib/accounting/chart-of-accounts-mapping-absolute-final-policy";

export function ChartOfAccountsMappingStrip() {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"
      data-testid="chart-of-accounts-mapping-strip"
    >
      <div className="flex items-start gap-3">
        <BookMarked className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="font-semibold">Chart of accounts mapping</p>
          <p className="text-sm text-muted-foreground">
            Map P&L lines to internal GL codes and QuickBooks accounts — BETA mapping layer for
            journal export, not a certified GL.
          </p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
        <Link href={CHART_OF_ACCOUNTS_MAPPING_ROUTE}>Open COA mapping</Link>
      </Button>
    </div>
  );
}
