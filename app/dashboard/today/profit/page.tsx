import { RealTimeProfitDashboard } from "@/components/analytics/real-time-profit-dashboard";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { getRealTimeProfit } from "@/services/analytics/real-time-profit-service";

export const dynamic = "force-dynamic";

export default async function TodayProfitPage() {
  const { dataUserId } = await getTenantActor();
  const [snapshot, settings] = await Promise.all([
    getRealTimeProfit(dataUserId),
    prisma.kitchenSettings.findUnique({
      where: { userId: dataUserId },
      select: { currency: true },
    }),
  ]);

  return (
    <RealTimeProfitDashboard
      initial={snapshot}
      currency={settings?.currency ?? "USD"}
    />
  );
}
