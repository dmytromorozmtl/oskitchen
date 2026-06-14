import Link from "next/link";

import { NativeBudgetingPanel } from "@/components/dashboard/finance/native-budgeting-panel";
import { NATIVE_BUDGETING_P3_91_HONESTY_NOTE } from "@/lib/finance/native-budgeting-p3-91-content";
import {
  NATIVE_BUDGETING_P3_91_CANONICAL_PATH,
  NATIVE_BUDGETING_P3_91_PNL_PATH,
  NATIVE_BUDGETING_P3_91_POLICY_ID,
} from "@/lib/finance/native-budgeting-p3-91-policy";
import { loadNativeBudgetSettings } from "@/lib/finance/native-budgeting-settings";
import { canExportReports } from "@/lib/reports/report-export-access";
import { requireReportsPageAccess } from "@/lib/reports/reports-page-access";
import { loadNativeBudgetVsActual } from "@/services/finance/native-budgeting-service";
import type { PnlPeriod } from "@/services/accounting/restaurant-pnl-service";

const PERIODS: { key: PnlPeriod; label: string }[] = [
  { key: "today", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "quarter", label: "Quarter" },
  { key: "year", label: "Year" },
];

export default async function NativeBudgetPage({
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

  const { userId } = access.actor;
  const [model, settings] = await Promise.all([
    loadNativeBudgetVsActual(userId, period),
    loadNativeBudgetSettings(userId),
  ]);
  const canEdit = canExportReports(access.actor);

  return (
    <div
      className="mx-auto max-w-5xl space-y-6 pb-24"
      data-testid="native-budgeting-page"
      data-native-budget-policy={NATIVE_BUDGETING_P3_91_POLICY_ID}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Finance</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Native budgeting</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Budget vs actual by category — set targets in-app, no accountant spreadsheet required.
          </p>
        </div>
        <Link
          href={NATIVE_BUDGETING_P3_91_PNL_PATH}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
        >
          Full P&amp;L statement →
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <Link
            key={p.key}
            href={`${NATIVE_BUDGETING_P3_91_CANONICAL_PATH}?period=${p.key}`}
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

      <p
        className="rounded-lg border border-border/70 bg-muted/30 px-4 py-3 text-sm text-muted-foreground"
        data-testid="native-budgeting-honesty-note"
      >
        {NATIVE_BUDGETING_P3_91_HONESTY_NOTE}
      </p>

      <NativeBudgetingPanel model={model} settings={settings} canEdit={canEdit} />
    </div>
  );
}
