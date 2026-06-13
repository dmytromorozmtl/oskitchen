import { redirect } from "next/navigation";

import { PlanGate } from "@/components/plans/plan-gate";
import { LazyPartnerOperationsCenter } from "@/components/charts/lazy-chart-panels";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { canProvisionPartnerOrganizations } from "@/lib/partner/partner-permissions";
import { prisma } from "@/lib/prisma";
import { getPartnerCommandCenterSnapshot } from "@/services/partner/partner-service";

export default async function PartnerDashboardPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (!profile) {
    redirect("/dashboard");
  }

  const [snapshot, canProvision] = await Promise.all([
    getPartnerCommandCenterSnapshot({ userId: dataUserId, email: user.email ?? null }),
    canProvisionPartnerOrganizations(user.id, user.email ?? null, profile.role),
  ]);

  return (
    <PlanGate userId={dataUserId} feature="api_access" title="Partner operations center">
      <LazyPartnerOperationsCenter initial={snapshot} canProvision={canProvision} />
    </PlanGate>
  );
}
