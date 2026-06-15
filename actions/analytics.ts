"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma, type AnalyticsAlertType } from "@prisma/client";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { defaultFilters, parseAnalyticsFilters } from "@/lib/analytics/filters";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { createAnalyticsSnapshot } from "@/services/analytics/snapshot-service";
import { buildOrdersCsv, buildRevenueCsv } from "@/services/analytics/reporting-service";

const REVALIDATE_PATHS = [
  "/dashboard/analytics",
  "/dashboard/analytics/revenue",
  "/dashboard/analytics/orders",
  "/dashboard/analytics/channels",
  "/dashboard/analytics/customers",
  "/dashboard/analytics/production",
  "/dashboard/analytics/delivery",
  "/dashboard/analytics/catering",
  "/dashboard/analytics/meal-plans",
  "/dashboard/analytics/inventory",
  "/dashboard/analytics/forecasting",
  "/dashboard/analytics/reports",
  "/dashboard/analytics/saved-views",
];

function revalidateAll() {
  for (const p of REVALIDATE_PATHS) revalidatePath(p);
}

/* ============================ snapshot ============================ */

export async function generateAnalyticsSnapshotAction() {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const snap = await createAnalyticsSnapshot({ userId: dataUserId });
    revalidateAll();
    return { ok: true as const, snapshotId: snap.id };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function generateAnalyticsSnapshotFormAction(_formData: FormData): Promise<void> {
  void (await generateAnalyticsSnapshotAction());
}

/* ============================ saved views ============================ */

const savedViewSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional().or(z.literal("")),
  tab: z.string().max(64).optional().or(z.literal("")),
  filtersQuery: z.string().max(2000).optional().or(z.literal("")),
});

export async function createAnalyticsSavedViewAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const parsed = savedViewSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
      tab: formData.get("tab"),
      filtersQuery: formData.get("filtersQuery"),
    });
    if (!parsed.success) return { error: "Name is required." };
    const d = parsed.data;

    // Parse the filter query string and store the normalised filters.
    const filters = parseAnalyticsFilters(new URLSearchParams(d.filtersQuery ?? ""));
    const filtersForStorage = {
      from: filters.from.toISOString(),
      to: filters.to.toISOString(),
      channel: filters.channel,
      brandId: filters.brandId,
      locationId: filters.locationId,
      fulfillmentType: filters.fulfillmentType,
      mealPlanOnly: filters.mealPlanOnly,
      cateringOnly: filters.cateringOnly,
    };

    const view = await prisma.analyticsSavedView.create({
      data: {
        userId: dataUserId,
        name: d.name,
        description: d.description || null,
        tab: d.tab || null,
        filtersJson: filtersForStorage as Prisma.InputJsonValue,
      },
    });
    await prisma.analyticsEvent.create({
      data: {
        userId: dataUserId,
        sourceType: "analytics_saved_view",
        sourceId: view.id,
        eventType: "VIEW_SAVED",
      },
    });
    revalidateAll();
    return { ok: true as const, viewId: view.id };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createAnalyticsSavedViewFormAction(formData: FormData): Promise<void> {
  void (await createAnalyticsSavedViewAction(formData));
}

export async function deleteAnalyticsSavedViewAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const id = String(formData.get("viewId") ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Invalid view id." };
    const view = await prisma.analyticsSavedView.findFirst({ where: { id, userId: dataUserId } });
    if (!view) return { error: "View not found." };
    await prisma.analyticsSavedView.delete({ where: { id: view.id } });
    await prisma.analyticsEvent.create({
      data: {
        userId: dataUserId,
        sourceType: "analytics_saved_view",
        sourceId: view.id,
        eventType: "VIEW_DELETED",
      },
    });
    revalidateAll();
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function deleteAnalyticsSavedViewFormAction(formData: FormData): Promise<void> {
  void (await deleteAnalyticsSavedViewAction(formData));
}

/* ============================ alerts ============================ */

const ALERT_TYPES = [
  "LATE_PACKING_RATE",
  "PRODUCTION_OVERLOAD",
  "CATERING_EVENT_CONFLICT",
  "LOW_REPEAT_RATE",
  "DECLINING_REVENUE",
  "RISING_CANCELLATIONS",
  "ROUTE_OVERLOAD",
  "HIGH_RISK_SHORTAGE",
  "VIP_CHURN_RISK",
] as const satisfies readonly AnalyticsAlertType[];

const alertSchema = z.object({
  type: z.enum(ALERT_TYPES),
  enabled: z.string().optional().or(z.literal("")),
});

export async function toggleAnalyticsAlertAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const parsed = alertSchema.safeParse({
      type: formData.get("type"),
      enabled: formData.get("enabled"),
    });
    if (!parsed.success) return { error: "Invalid alert input." };
    const enabled = parsed.data.enabled === "true" || parsed.data.enabled === "on";
    await prisma.analyticsAlert.upsert({
      where: { userId_type: { userId: dataUserId, type: parsed.data.type } },
      create: { userId: dataUserId, type: parsed.data.type, enabled },
      update: { enabled },
    });
    revalidateAll();
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function toggleAnalyticsAlertFormAction(formData: FormData): Promise<void> {
  void (await toggleAnalyticsAlertAction(formData));
}

/* ============================ exports ============================ */

const exportSchema = z.object({
  kind: z.enum(["revenue", "orders"]),
  filtersQuery: z.string().max(2000).optional().or(z.literal("")),
});

export async function exportAnalyticsCsvAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const parsed = exportSchema.safeParse({
      kind: formData.get("kind"),
      filtersQuery: formData.get("filtersQuery"),
    });
    if (!parsed.success) return { error: "Invalid export input." };
    const filters = parsed.data.filtersQuery
      ? parseAnalyticsFilters(new URLSearchParams(parsed.data.filtersQuery))
      : defaultFilters();
    const csv = parsed.data.kind === "revenue"
      ? await buildRevenueCsv({ userId: dataUserId }, filters)
      : await buildOrdersCsv({ userId: dataUserId }, filters);
    await prisma.analyticsEvent.create({
      data: {
        userId: dataUserId,
        sourceType: "analytics_export",
        sourceId: parsed.data.kind,
        eventType: "EXPORT_REQUESTED",
      },
    });
    return { ok: true as const, csv };
  } catch (e) {
    return { error: safeError(e) };
  }
}
