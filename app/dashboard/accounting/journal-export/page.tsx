import Link from "next/link";

import { JournalEntryExportPanel } from "@/components/dashboard/accounting/journal-entry-export-panel";
import { canExportReports } from "@/lib/reports/report-export-access";
import { requireReportsPageAccess } from "@/lib/reports/reports-page-access";
import { loadJournalEntryExportModel } from "@/services/accounting/journal-entry-export-service";
import type { PnlPeriod } from "@/services/accounting/restaurant-pnl-service";

const PERIODS: { key: PnlPeriod; label: string }[] = [
  { key: "today", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "quarter", label: "Quarter" },
  { key: "year", label: "Year" },
];

export default async function JournalEntryExportPage({
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
  const model = await loadJournalEntryExportModel(access.actor.dataUserId, period, canExport);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Accounting · Journal export
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Journal entry export</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Export balanced journal entries in CSV, JSON, or QuickBooks-mapped CSV — BETA operational
          finance layer with COA mapping overlays. Accountant review required; Do not claim native
          GL certification.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <Link
            key={p.key}
            href={`/dashboard/accounting/journal-export?period=${p.key}`}
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

      <JournalEntryExportPanel model={model} />
    </div>
  );
}
