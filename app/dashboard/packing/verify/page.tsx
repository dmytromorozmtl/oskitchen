import { PackingVerifyClient } from "@/components/dashboard/packing-verify-client";
import { PermissionDeniedSurfaceCard } from "@/components/dashboard/permission-denied-surface-card";
import { PlanGate } from "@/components/plans/plan-gate";
import { hasPermission } from "@/lib/permissions/guards";
import { requireWorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { getServerEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { listOpenSessions, listRecentScans } from "@/services/packing-verification/verification-service";

export default async function PackingVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const actor = await requireWorkspacePermissionActor();

  if (!hasPermission(actor.granted, "packing.manage")) {
    return <PermissionDeniedSurfaceCard surfaceId="packing_verify" />;
  }

  const { sessionUser: user, dataUserId } = actor;
  const { t } = await searchParams;
  const env = getServerEnv();
  const origin =
    env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

  const [profile, recentScansRaw, openSessionsRaw] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { id: dataUserId },
      select: { kitchenSettings: { select: { businessType: true } } },
    }),
    listRecentScans(dataUserId, 20),
    listOpenSessions(dataUserId, 12),
  ]);

  const recentScans = recentScansRaw.map((s) => ({
    id: s.id,
    token: s.token,
    tokenType: s.tokenType,
    source: s.source,
    success: s.success,
    errorMessage: s.errorMessage,
    scannedAt: s.scannedAt.toISOString(),
  }));

  const openSessions = openSessionsRaw.map((s) => ({
    id: s.id,
    status: s.status,
    startedAt: s.startedAt.toISOString(),
    itemCount: s._count.items,
    order: s.order,
  }));

  return (
    <PlanGate userId={dataUserId} feature="packing_labels" title="Packing verification">
      <PackingVerifyClient
        initialToken={t?.trim() ?? ""}
        appOrigin={origin}
        businessType={profile?.kitchenSettings?.businessType ?? null}
        recentScans={recentScans}
        openSessions={openSessions}
      />
    </PlanGate>
  );
}
