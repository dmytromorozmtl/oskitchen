"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { canViewExecutive } from "@/lib/executive/executive-permissions";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { prisma } from "@/lib/prisma";
import {
  loadExecutiveOverview,
  persistExecutiveSnapshot,
  syncExecutiveInsights,
} from "@/services/executive/executive-dashboard-service";

const EXECUTIVE_PATH = "/dashboard/executive";

function actorScopeFromUser(user: { id: string; email?: string | null }) {
  return { isOwner: true, email: user.email ?? null, role: null };
}

const refreshSchema = z.object({
  filtersQuery: z.string().optional().or(z.literal("")),
  periodType: z.enum(["DAILY", "WEEKLY", "MONTHLY"]).default("DAILY"),
});

export async function refreshExecutiveSnapshotAction(
  input: z.infer<typeof refreshSchema>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const scope = actorScopeFromUser(user);
    if (!canViewExecutive(scope, "executive.view")) {
      return { ok: false, error: "Forbidden" };
    }
    const parsed = refreshSchema.parse(input);
    const filters = parseAnalyticsFilters(
      Object.fromEntries(new URLSearchParams(parsed.filtersQuery ?? "")),
    );
    const overview = await loadExecutiveOverview({ userId: dataUserId }, filters);
    await persistExecutiveSnapshot({ userId: dataUserId }, overview, parsed.periodType);
    await syncExecutiveInsights({ userId: dataUserId }, overview);
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
  const { sessionUser: user, dataUserId } = await requireTenantActor();
  const scope = actorScopeFromUser(user);
  if (!canViewExecutive(scope, "executive.insights.manage")) {
    throw new Error("Forbidden");
  }
  await prisma.executiveInsight.updateMany({
    where: { id: insightId, userId: dataUserId, status: "OPEN" },
    data: { status: "RESOLVED", resolvedAt: new Date(), resolvedBy: user.email ?? "user" },
  });
  revalidatePath(EXECUTIVE_PATH);
}

export async function dismissExecutiveInsightAction(insightId: string) {
  const { sessionUser: user, dataUserId } = await requireTenantActor();
  const scope = actorScopeFromUser(user);
  if (!canViewExecutive(scope, "executive.insights.manage")) {
    throw new Error("Forbidden");
  }
  await prisma.executiveInsight.updateMany({
    where: { id: insightId, userId: dataUserId, status: "OPEN" },
    data: { status: "DISMISSED", resolvedAt: new Date(), resolvedBy: user.email ?? "user" },
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
