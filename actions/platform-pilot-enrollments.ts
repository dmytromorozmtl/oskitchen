"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { recordPlatformAudit } from "@/lib/platform-audit";
import {
  assertPlatformPermission,
  requirePlatformAccess,
} from "@/lib/platform/platform-guards";
import { prisma } from "@/lib/prisma";
import { listPilotOnlyReadinessIds } from "@/lib/product/module-readiness";
import { workspacePilotFeatureKey } from "@/services/platform/workspace-pilot-enrollment-service";

const pilotIds = listPilotOnlyReadinessIds();
const pilotIdEnum = z.enum(
  pilotIds as [typeof pilotIds[number], ...typeof pilotIds[number][]],
);

const setSchema = z.object({
  workspaceId: z.string().uuid(),
  readinessId: pilotIdEnum,
});

export async function setWorkspacePilotEnrollmentAction(
  formData: FormData,
): Promise<void> {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:feature-flags:write");

  const parsed = setSchema.parse({
    workspaceId: formData.get("workspaceId"),
    readinessId: formData.get("readinessId"),
  });

  await prisma.workspaceFeatureOverride.upsert({
    where: {
      workspaceId_featureKey: {
        workspaceId: parsed.workspaceId,
        featureKey: workspacePilotFeatureKey(parsed.readinessId),
      },
    },
    create: {
      workspaceId: parsed.workspaceId,
      featureKey: workspacePilotFeatureKey(parsed.readinessId),
      enabled: true,
    },
    update: {
      enabled: true,
    },
  });

  await recordPlatformAudit({
    adminUserId: ctx.userId,
    action: "platform.pilot-module.enroll",
    entityType: "workspace",
    entityId: parsed.workspaceId,
    targetWorkspaceId: parsed.workspaceId,
    metadata: { readinessId: parsed.readinessId },
  });

  revalidatePath("/platform/feature-flags");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings/modules");
}

export async function clearWorkspacePilotEnrollmentAction(
  formData: FormData,
): Promise<void> {
  const ctx = await requirePlatformAccess();
  assertPlatformPermission(ctx, "platform:feature-flags:write");

  const parsed = setSchema.parse({
    workspaceId: formData.get("workspaceId"),
    readinessId: formData.get("readinessId"),
  });

  await prisma.workspaceFeatureOverride.deleteMany({
    where: {
      workspaceId: parsed.workspaceId,
      featureKey: workspacePilotFeatureKey(parsed.readinessId),
    },
  });

  await recordPlatformAudit({
    adminUserId: ctx.userId,
    action: "platform.pilot-module.clear",
    entityType: "workspace",
    entityId: parsed.workspaceId,
    targetWorkspaceId: parsed.workspaceId,
    metadata: { readinessId: parsed.readinessId },
  });

  revalidatePath("/platform/feature-flags");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings/modules");
}
