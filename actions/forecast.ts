"use server";


import { fail, ok } from "@/lib/action-result";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import { FORECAST_SOURCE_VALUES, FORECAST_TYPE_VALUES } from "@/lib/forecast/forecast-types";
import {
  addForecastAdjustment,
  archiveForecastRun,
  createForecastRun,
  restoreForecastRun,
  sendForecastToIngredientDemand,
  sendForecastToProduction,
} from "@/services/forecast/forecast-service";

const PATHS = [
  "/dashboard/forecast",
  "/dashboard/forecast/history",
  "/dashboard/forecast/settings",
];

function revalidateAll() {
  for (const p of PATHS) revalidatePath(p);
}

function parseDate(value: FormDataEntryValue | null): Date | null {
  if (!value) return null;
  const s = String(value);
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/* ============================ Run forecast ============================ */

const runSchema = z.object({
  title: z.string().min(1).max(255),
  forecastType: z.enum(FORECAST_TYPE_VALUES as unknown as [string, ...string[]]),
  dateFrom: z.string().min(1),
  dateTo: z.string().min(1),
  sources: z.array(z.enum(FORECAST_SOURCE_VALUES as unknown as [string, ...string[]])).min(1),
  bufferPercent: z.coerce.number().min(0).max(100).optional(),
  brandId: z.string().uuid().optional().or(z.literal("")),
  locationId: z.string().uuid().optional().or(z.literal("")),
  menuId: z.string().uuid().optional().or(z.literal("")),
  channel: z.string().optional().or(z.literal("")),
  fulfillmentType: z.enum(["PICKUP", "DELIVERY"]).optional().or(z.literal("")),
});

export async function runForecastAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const sourcesRaw = formData.getAll("sources").map(String).filter(Boolean);
    const parsed = runSchema.safeParse({
      title: formData.get("title"),
      forecastType: formData.get("forecastType"),
      dateFrom: formData.get("dateFrom"),
      dateTo: formData.get("dateTo"),
      sources: sourcesRaw,
      bufferPercent: formData.get("bufferPercent") ?? undefined,
      brandId: formData.get("brandId") ?? undefined,
      locationId: formData.get("locationId") ?? undefined,
      menuId: formData.get("menuId") ?? undefined,
      channel: formData.get("channel") ?? undefined,
      fulfillmentType: formData.get("fulfillmentType") ?? undefined,
    });
    if (!parsed.success) return { error: "Invalid forecast input." };
    const d = parsed.data;
    const dateFrom = parseDate(d.dateFrom);
    const dateTo = parseDate(d.dateTo);
    if (!dateFrom || !dateTo) return { error: "Invalid dates." };

    const run = await createForecastRun({
      userId: dataUserId,
      title: d.title,
      forecastType: d.forecastType as Parameters<typeof createForecastRun>[0]["forecastType"],
      dateFrom,
      dateTo,
      sources: d.sources as Parameters<typeof createForecastRun>[0]["sources"],
      bufferPercent: d.bufferPercent,
      brandId: d.brandId || null,
      locationId: d.locationId || null,
      menuId: d.menuId || null,
      channel: d.channel || null,
      fulfillmentType: (d.fulfillmentType || null) as "PICKUP" | "DELIVERY" | null,
      createdBy: user.email ?? null,
    });
    revalidateAll();
    return { ok: true as const, runId: run.id };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function runForecastFormAction(formData: FormData): Promise<void> {
  const result = await runForecastAction(formData);
  if ("ok" in result && result.ok) {
    redirect(`/dashboard/forecast/${result.runId}`);
  }
}

/* ============================ Adjustments ============================ */

const adjustmentSchema = z.object({
  forecastRunId: z.string().uuid(),
  targetType: z.enum(["global", "product", "category"]),
  targetId: z.string().optional().or(z.literal("")),
  adjustmentType: z.enum(["PERCENT", "FIXED_QUANTITY", "OVERRIDE"]),
  value: z.coerce.number(),
  reason: z.string().max(500).optional().or(z.literal("")),
});

export async function addForecastAdjustmentAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const parsed = adjustmentSchema.safeParse({
      forecastRunId: formData.get("forecastRunId"),
      targetType: formData.get("targetType"),
      targetId: formData.get("targetId") ?? "",
      adjustmentType: formData.get("adjustmentType"),
      value: formData.get("value"),
      reason: formData.get("reason") ?? "",
    });
    if (!parsed.success) return { error: "Invalid adjustment." };
    const d = parsed.data;
    await addForecastAdjustment({
      forecastRunId: d.forecastRunId,
      userId: dataUserId,
      targetType: d.targetType,
      targetId: d.targetId || null,
      adjustmentType: d.adjustmentType,
      value: d.value,
      reason: d.reason || null,
      performedBy: user.email ?? null,
    });
    revalidatePath(`/dashboard/forecast/${d.forecastRunId}`);
    revalidatePath("/dashboard/forecast");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function addForecastAdjustmentFormAction(formData: FormData): Promise<void> {
  void (await addForecastAdjustmentAction(formData));
}

/* ============================ Send to production ============================ */

const sendToProductionSchema = z.object({
  forecastRunId: z.string().uuid(),
  title: z.string().min(1).max(255),
  productionDate: z.string().min(1),
});

export async function sendForecastToProductionAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const parsed = sendToProductionSchema.safeParse({
      forecastRunId: formData.get("forecastRunId"),
      title: formData.get("title"),
      productionDate: formData.get("productionDate"),
    });
    if (!parsed.success) return { error: "Invalid production input." };
    const d = parsed.data;
    const date = parseDate(d.productionDate);
    if (!date) return { error: "Invalid production date." };
    const batch = await sendForecastToProduction({
      forecastRunId: d.forecastRunId,
      userId: dataUserId,
      productionDate: date,
      title: d.title,
      performedBy: user.email ?? null,
    });
    revalidatePath(`/dashboard/forecast/${d.forecastRunId}`);
    revalidatePath("/dashboard/production");
    return { ok: true as const, batchId: batch.id };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function sendForecastToProductionFormAction(formData: FormData): Promise<void> {
  void (await sendForecastToProductionAction(formData));
}

/* ============================ Send to ingredient demand ============================ */

const sendToDemandSchema = z.object({
  forecastRunId: z.string().uuid(),
  title: z.string().min(1).max(255),
});

export async function sendForecastToIngredientDemandAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const parsed = sendToDemandSchema.safeParse({
      forecastRunId: formData.get("forecastRunId"),
      title: formData.get("title"),
    });
    if (!parsed.success) return { error: "Invalid demand input." };
    const d = parsed.data;
    const demandRun = await sendForecastToIngredientDemand({
      forecastRunId: d.forecastRunId,
      userId: dataUserId,
      title: d.title,
      performedBy: user.email ?? null,
    });
    revalidatePath(`/dashboard/forecast/${d.forecastRunId}`);
    revalidatePath("/dashboard/ingredient-demand");
    return { ok: true as const, demandRunId: demandRun.id };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function sendForecastToIngredientDemandFormAction(formData: FormData): Promise<void> {
  void (await sendForecastToIngredientDemandAction(formData));
}

/* ============================ Archive / restore ============================ */

const idSchema = z.object({ forecastRunId: z.string().uuid() });

export async function archiveForecastRunAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const parsed = idSchema.safeParse({ forecastRunId: formData.get("forecastRunId") });
    if (!parsed.success) return { error: "Invalid run id." };
    await archiveForecastRun(user.id, parsed.data.forecastRunId);
    revalidateAll();
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function archiveForecastRunFormAction(formData: FormData): Promise<void> {
  void (await archiveForecastRunAction(formData));
}

export async function restoreForecastRunAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const parsed = idSchema.safeParse({ forecastRunId: formData.get("forecastRunId") });
    if (!parsed.success) return { error: "Invalid run id." };
    await restoreForecastRun(user.id, parsed.data.forecastRunId);
    revalidateAll();
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function restoreForecastRunFormAction(formData: FormData): Promise<void> {
  void (await restoreForecastRunAction(formData));
}
