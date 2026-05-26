"use server";

import { revalidatePath } from "next/cache";

import { requireSessionUser } from "@/lib/auth";
import { mergeIngredientDemandSettings } from "@/lib/ingredient-demand/settings";
import { prisma } from "@/lib/prisma";
import {
  loadDemandCommandCenterPayload,
  persistIngredientDemandRun,
} from "@/services/ingredient-demand/demand-service";

export async function saveIngredientDemandSettingsAction(raw: unknown) {
  const user = await requireSessionUser();
  const existing = await prisma.kitchenSettings.findUnique({
    where: { userId: user.id },
    select: { ingredientDemandSettingsJson: true },
  });
  const base =
    existing?.ingredientDemandSettingsJson && typeof existing.ingredientDemandSettingsJson === "object"
      ? (existing.ingredientDemandSettingsJson as Record<string, unknown>)
      : {};
  const patch = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const merged = mergeIngredientDemandSettings({ ...base, ...patch });
  await prisma.kitchenSettings.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      ingredientDemandSettingsJson: merged as object,
    },
    update: { ingredientDemandSettingsJson: merged as object },
  });
  revalidatePath("/dashboard/inventory/demand");
  revalidatePath("/dashboard/inventory/demand/settings");
}

export async function runDemandCalculationAndSaveAction(input: {
  title?: string;
  dateFromIso: string;
  dateToIso: string;
  brandId?: string | null;
  locationId?: string | null;
}) {
  const user = await requireSessionUser();
  const dateFrom = new Date(input.dateFromIso);
  const dateTo = new Date(input.dateToIso);
  const payload = await loadDemandCommandCenterPayload(user.id, {
    dateFrom,
    dateTo,
    brandId: input.brandId ?? null,
    locationId: input.locationId ?? null,
  });
  const title =
    input.title?.trim() ||
    `Demand ${dateFrom.toISOString().slice(0, 10)} → ${dateTo.toISOString().slice(0, 10)}`;

  const run = await persistIngredientDemandRun({
    userId: user.id,
    createdById: user.id,
    title,
    dateFrom,
    dateTo,
    payload,
    filterBrandId: input.brandId ?? null,
    filterLocationId: input.locationId ?? null,
  });

  revalidatePath("/dashboard/inventory/demand");
  revalidatePath("/dashboard/purchasing");
  return { ok: true as const, runId: run.id };
}
