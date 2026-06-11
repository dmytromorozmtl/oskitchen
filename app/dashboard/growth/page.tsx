import { GrowthCommandCenter, type GrowthCommandCenterSerialized } from "@/components/growth/growth-command-center";
import { getGrowthCommandCenterSnapshot } from "@/services/growth/growth-service";

function serializeCommandCenter(
  snap: Awaited<ReturnType<typeof getGrowthCommandCenterSnapshot>>,
): GrowthCommandCenterSerialized {
  return {
    kpis: snap.kpis,
    leadFunnel: snap.leadFunnel,
    demoFunnel: snap.demoFunnel,
    signupsWeekly: snap.signupsWeekly,
    activationFunnel: snap.activationFunnel,
    usageTop: snap.usageTop,
    healthMix: snap.healthMix,
    atRisk: snap.atRisk,
    expansion: snap.expansion,
    outreachCampaigns: snap.outreachCampaigns.map((c) => ({
      id: c.id,
      name: c.name,
      channel: c.channel,
      audience: c.audience,
      status: c.status,
      createdAt: c.createdAt.toISOString(),
    })),
    content: snap.content,
    onboarding: snap.onboarding,
  };
}

export default async function GrowthOverviewPage() {
  const snapshot = await getGrowthCommandCenterSnapshot();
  const data = serializeCommandCenter(snapshot);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/70 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
        Founder Growth Command Center — revenue, acquisition, activation, retention, and expansion in one surface. Data is
        internal; never exposed to tenant staff outside Growth permissions.
      </div>
      <GrowthCommandCenter data={data} />
    </div>
  );
}
