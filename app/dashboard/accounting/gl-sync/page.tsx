import Link from "next/link";

import { ChartOfAccountsMappingStrip } from "@/components/dashboard/accounting/chart-of-accounts-mapping-strip";
import { JournalEntryExportStrip } from "@/components/dashboard/accounting/journal-entry-export-strip";
import { PnlReconciliationViewStrip } from "@/components/dashboard/accounting/pnl-reconciliation-view-strip";
import { GlDepthSyncPanel } from "@/components/dashboard/accounting/gl-depth-sync-panel";
import { canExportReports } from "@/lib/reports/report-export-access";
import { requireReportsPageAccess } from "@/lib/reports/reports-page-access";
import { loadGlDepthAccountingModel } from "@/services/accounting/gl-depth-accounting-service";
import type { PnlPeriod } from "@/services/accounting/restaurant-pnl-service";

const PERIODS: { key: PnlPeriod; label: string }[] = [
  { key: "today", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "quarter", label: "Quarter" },
  { key: "year", label: "Year" },
];

export default async function GlDepthAccountingSyncPage({
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

  const { actor } = access;
  const model = await loadGlDepthAccountingModel(actor.dataUserId, period);
  const canExport = canExportReports(actor);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">GL-depth accounting sync</h1>
          <p className="text-sm text-muted-foreground">
            Chart of accounts · journal entries · P&L reconciliation — operational finance depth,
            not a certified native GL.
          </p>
        </div>
        <Link
          href="/dashboard/reports/financial/pnl"
          className="text-sm text-primary hover:underline"
        >
          Open restaurant P&L →
        </Link>
      </div>

      <ChartOfAccountsMappingStrip />
      <JournalEntryExportStrip />
      <PnlReconciliationViewStrip />

      <div className="flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <Link
            key={p.key}
            href={`/dashboard/accounting/gl-sync?period=${p.key}`}
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

      <GlDepthSyncPanel model={model} canExport={canExport} />
    </div>
  );
}
