import { ProfitEngineBreakdown } from "@/components/analytics/profit-engine-breakdown";
import { RealTimeProfitDashboard } from "@/components/analytics/real-time-profit-dashboard";
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
    <div className="space-y-8">
      <RealTimeProfitDashboard initial={snapshot} currency={currency} />
      <div className="mx-auto max-w-lg px-0 pb-12">
        <ProfitEngineBreakdown initial={engine} currency={currency} />
      </div>
    </div>
  );
}
