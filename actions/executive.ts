"use server";


import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { createExecutiveActorScope } from "@/lib/executive/executive-actor-scope";
import { workspacePermissionForExecutiveCapability } from "@/lib/executive/executive-permission-keys";
import {
  canViewExecutive,
  type ExecutivePermission,
} from "@/lib/executive/executive-permissions";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { prisma } from "@/lib/prisma";
import { logExecutivePermissionDenied } from "@/services/executive/executive-permission-audit";
import {
  loadExecutiveOverview,
  persistExecutiveSnapshot,
  syncExecutiveInsights,
} from "@/services/executive/executive-dashboard-service";

const EXECUTIVE_PATH = "/dashboard/executive";

async function gate(capability: ExecutivePermission) {
  const required = workspacePermissionForExecutiveCapability(capability);
  const access = await requireMutationPermission(required);
  if (!access.ok) {
    await logExecutivePermissionDenied(access.actor, {
      requiredPermission: required,
      operation: capability,
      executiveCapability: capability,
    });
    throw new Error(access.error);
  }
  const scope = createExecutiveActorScope(access.actor);
  if (!canViewExecutive(scope, capability)) {
    await logExecutivePermissionDenied(access.actor, {
      requiredPermission: required,
      operation: capability,
      executiveCapability: capability,
    });
    throw new Error(`You do not have permission to ${capability}.`);
  }
  return {
    userId: access.actor.userId,
    sessionUserId: access.actor.sessionUserId,
    email: access.actor.email,
  };
}

const refreshSchema = z.object({
  filtersQuery: z.string().optional().or(z.literal("")),
  periodType: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).default("DAILY"),
});

export async function refreshExecutiveSnapshotAction(
  input: z.infer<typeof refreshSchema>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { userId } = await gate("executive.view");
    const parsed = refreshSchema.parse(input);
    const filters = parseAnalyticsFilters(
      Object.fromEntries(new URLSearchParams(parsed.filtersQuery ?? "")),
    );
    const overview = await loadExecutiveOverview({ userId }, filters);
    await persistExecutiveSnapshot({ userId }, overview, parsed.periodType);
    await syncExecutiveInsights({ userId }, overview);
    revalidatePath(EXECUTIVE_PATH);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unable to refresh" };
  }
}

export async function refreshExecutiveSnapshotFormAction(formData: FormData) {
  await refreshExecutiveSnapshotAction({
    filtersQuery: String(formData.get("filtersQuery") ?? ""),
    periodType: (String(formData.get("periodType") ?? "DAILY") as "DAILY" | "WEEKLY" | "MONTHLY"),
  });
}

export async function resolveExecutiveInsightAction(insightId: string) {
  const { userId, email } = await gate("executive.insights.manage");
  await prisma.executiveInsight.updateMany({
    where: { id: insightId, userId, status: "OPEN" },
    data: { status: "RESOLVED", resolvedAt: new Date(), resolvedBy: email ?? "user" },
  });
  revalidatePath(EXECUTIVE_PATH);
}

export async function dismissExecutiveInsightAction(insightId: string) {
  const { userId, email } = await gate("executive.insights.manage");
  await prisma.executiveInsight.updateMany({
    where: { id: insightId, userId, status: "OPEN" },
    data: { status: "DISMISSED", resolvedAt: new Date(), resolvedBy: email ?? "user" },
  });
  revalidatePath(EXECUTIVE_PATH);
}

export async function resolveExecutiveInsightFormAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (id) await resolveExecutiveInsightAction(id);
}

export async function dismissExecutiveInsightFormAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (id) await dismissExecutiveInsightAction(id);
}
