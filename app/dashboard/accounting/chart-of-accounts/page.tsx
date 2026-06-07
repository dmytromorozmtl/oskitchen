import { ChartOfAccountsMappingPanel } from "@/components/dashboard/accounting/chart-of-accounts-mapping-panel";
import { requireReportsPageAccess } from "@/lib/reports/reports-page-access";
import { loadChartOfAccountsMappingModel } from "@/services/accounting/chart-of-accounts-mapping-service";

export default async function ChartOfAccountsMappingPage() {
  const access = await requireReportsPageAccess("reports.read.financial");
  if (!access.ok) {
    return access.deny;
  }

  const model = await loadChartOfAccountsMappingModel(access.actor.dataUserId);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Accounting · Chart of accounts
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">Chart of accounts mapping</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Map operational P&L lines to GL account codes and optional QuickBooks accounts. BETA —
          export journals for accountant review; Do not claim native GL certification.
        </p>
      </div>

      <ChartOfAccountsMappingPanel model={model} />
    </div>
  );
}
