import Link from "next/link";
import { Scale } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PNL_RECONCILIATION_VIEW_ROUTE } from "@/lib/accounting/pnl-reconciliation-view-absolute-final-policy";

export function PnlReconciliationViewStrip() {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"
      data-testid="pnl-reconciliation-view-strip"
    >
      <div className="flex items-start gap-3">
        <Scale className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
        <div>
          <p className="font-semibold">P&L reconciliation view</p>
          <p className="text-sm text-muted-foreground">
            Line-by-line operational P&L vs journal GL with synced/minor/material severity — BETA,
            not a certified GL.
          </p>
        </div>
      </div>
      <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
        <Link href={PNL_RECONCILIATION_VIEW_ROUTE}>Open reconciliation</Link>
      </Button>
    </div>
  );
}
