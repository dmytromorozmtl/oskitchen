import { ProfitEngineBreakdown } from "@/components/analytics/profit-engine-breakdown";
import { RealTimeProfitDashboard } from "@/components/analytics/real-time-profit-dashboard";
import { PageHeader } from "@/components/layout/page-header";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { getProfitEngineSnapshot } from "@/services/analytics/profit-engine-service";
import { getRealTimeProfit } from "@/services/analytics/real-time-profit-service";

export const dynamic = "force-dynamic";

export default async function TodayProfitPage() {
  const { dataUserId } = await getTenantActor();
  const currencyPromise = prisma.kitchenSettings.findUnique({
    where: { userId: dataUserId },
    select: { currency: true },
  });
  const [snapshot, engine, settings] = await Promise.all([
    getRealTimeProfit(dataUserId),
    getProfitEngineSnapshot(dataUserId),
    currencyPromise,
  ]);
  const currency = settings?.currency ?? "USD";

  return (
    <PageShell className="space-y-8">
      <PageHeader
        title="Real-time profit"
        description="Margin and COGS from recipe costing — honest BETA analytics, not audited financial statements."
      />
      <PageSection
        title="Live margin"
        description="Real-time revenue, COGS, and margin from open orders and recipe costing."
      >
        <RealTimeProfitDashboard initial={snapshot} currency={currency} />
      </PageSection>
      <PageSection
        title="Profit engine breakdown"
        description="Channel and category contribution — BETA analytics, not audited financial statements."
        className="mx-auto max-w-lg pb-12"
      >
        <ProfitEngineBreakdown initial={engine} currency={currency} />
      </PageSection>
    </PageShell>
  );
}
