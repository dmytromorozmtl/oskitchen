import { prisma } from "@/lib/prisma";
import { listPilotOnlyReadinessIds } from "@/lib/product/module-readiness";

const PILOT_MODULE_PREFIX = "pilot_module.";

export function workspacePilotFeatureKey(readinessId: string): string {
  return `${PILOT_MODULE_PREFIX}${readinessId}`;
}

export function pilotReadinessIdFromFeatureKey(featureKey: string): string | null {
  if (!featureKey.startsWith(PILOT_MODULE_PREFIX)) return null;
  return featureKey.slice(PILOT_MODULE_PREFIX.length) || null;
}

export function supportedPilotEnrollmentKeys(): string[] {
  return listPilotOnlyReadinessIds().map(workspacePilotFeatureKey);
}

export async function getEnrolledPilotReadinessIdsForWorkspace(
  workspaceId: string | null | undefined,
): Promise<Set<string>> {
  if (!workspaceId) return new Set();

  const rows = await prisma.workspaceFeatureOverride.findMany({
    where: {
      workspaceId,
      featureKey: { in: supportedPilotEnrollmentKeys() },
      enabled: true,
    },
    select: { featureKey: true },
  });

  return new Set(
    rows
      .map((row) => pilotReadinessIdFromFeatureKey(row.featureKey))
      .filter((value): value is string => Boolean(value)),
  );
}

export async function listActivePilotWorkspaceEnrollments() {
  // eslint-disable-next-line kitchenos/require-owner-scope -- platform admin view intentionally spans multiple workspaces.
  const rows = await prisma.workspaceFeatureOverride.findMany({
    where: {
      featureKey: { in: supportedPilotEnrollmentKeys() },
      enabled: true,
    },
    select: {
      id: true,
      workspaceId: true,
      featureKey: true,
      createdAt: true,
      updatedAt: true,
      workspace: {
        select: {
          name: true,
          ownerUserId: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }],
  });

  return rows.map((row) => ({
    ...row,
    readinessId: pilotReadinessIdFromFeatureKey(row.featureKey),
  }));
}
