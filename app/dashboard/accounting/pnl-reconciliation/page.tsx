import Link from "next/link";

import { PnlReconciliationViewPanel } from "@/components/dashboard/accounting/pnl-reconciliation-view-panel";
import { canExportReports } from "@/lib/reports/report-export-access";
import { requireReportsPageAccess } from "@/lib/reports/reports-page-access";
import { loadPnlReconciliationViewModel } from "@/services/accounting/pnl-reconciliation-view-service";
import type { PnlPeriod } from "@/services/accounting/restaurant-pnl-service";

const PERIODS: { key: PnlPeriod; label: string }[] = [
  { key: "today", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "quarter", label: "Quarter" },
  { key: "year", label: "Year" },
];

export default async function PnlReconciliationViewPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period: raw } = await searchParams;
  const valid: PnlPeriod[] = ["today", "week", "month", "quarter", "year"];
  const period: PnlPeriod = valid.includes(raw as PnlPeriod) ? (raw as PnlPeriod) : "month";

  const access = await requireReportsPageAccess("reports.read.financial");
  if (!access.ok) {
    return access.deny;
  }

  const canExport = canExportReports(access.actor);
  const model = await loadPnlReconciliationViewModel(access.actor.dataUserId, period, canExport);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Accounting · P&L reconciliation
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">P&L reconciliation view</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Compare operational P&L statement amounts to journal-derived GL totals line by line —
          BETA severity bands (synced, minor, material). Do not claim audit-grade reconciliation.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <Link
            key={p.key}
            href={`/dashboard/accounting/pnl-reconciliation?period=${p.key}`}
            className={`rounded-md px-3 py-1.5 text-sm ${
              period === p.key
                ? "bg-primary text-primary-foreground"
                : "border border-border hover:bg-muted"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <PnlReconciliationViewPanel model={model} />
    </div>
  );
}
