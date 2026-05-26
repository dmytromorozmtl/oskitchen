import { GettingStartedChecklist } from "@/components/dashboard/getting-started-checklist";
import { OperatorTourLauncher } from "@/components/onboarding/operator-tour";
import { TodayCommandCenterView } from "@/components/dashboard/today-command-center";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { loadGettingStartedStatus } from "@/services/onboarding/getting-started-status";
import { loadTodayCommandCenter } from "@/services/today/today-command-center-service";

export const dynamic = "force-dynamic";

export default async function TodayOperationsPage() {
  const { sessionUser, dataUserId } = await getTenantActor();
  const [data, profile] = await Promise.all([
    loadTodayCommandCenter(dataUserId),
    prisma.userProfile.findUnique({
      where: { id: dataUserId },
      select: { createdAt: true },
    }),
  ]);
  const gettingStarted = await loadGettingStartedStatus(
    dataUserId,
    profile?.createdAt ?? new Date(),
  );

  return (
    <>
      <OperatorTourLauncher />
      <div className="space-y-6">
        <GettingStartedChecklist data={gettingStarted} />
        <TodayCommandCenterView
          userId={dataUserId}
          email={sessionUser.email ?? null}
          data={data}
        />
      </div>
    </>
  );
}
