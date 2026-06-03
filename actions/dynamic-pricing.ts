"use server";

import { revalidatePath } from "next/cache";

import { fail, ok } from "@/lib/action-result";
import type { DynamicPricingWeather } from "@/lib/ai/dynamic-pricing-types";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import {
  applyDynamicPricingSuggestion,
  endDynamicPricingAbTest,
  loadDynamicPricingDashboard,
  setDynamicPricingEnabled,
  setDynamicPricingWeather,
  startDynamicPricingAbTest,
} from "@/services/ai/dynamic-pricing-service";

const PATH = "/dashboard/menu/dynamic-pricing";

function revalidate() {
  revalidatePath(PATH);
  revalidatePath("/dashboard/menu");
}

export async function refreshDynamicPricingAction() {
  try {
    const { dataUserId } = await requireTenantActor();
    const dashboard = await loadDynamicPricingDashboard(dataUserId);
    revalidate();
    return ok(dashboard);
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function toggleDynamicPricingAction(enabled: boolean) {
  try {
    const { dataUserId } = await requireTenantActor();
    const dashboard = await setDynamicPricingEnabled(dataUserId, enabled);
    revalidate();
    return ok(dashboard);
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function setDynamicPricingWeatherAction(weather: DynamicPricingWeather | null) {
  try {
    const { dataUserId } = await requireTenantActor();
    const dashboard = await setDynamicPricingWeather(dataUserId, weather);
    revalidate();
    return ok(dashboard);
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function applyDynamicPricingSuggestionAction(input: {
  productId: string;
  suggestedPrice: number;
}) {
  try {
    const { dataUserId } = await requireTenantActor();
    const dashboard = await applyDynamicPricingSuggestion(
      dataUserId,
      input.productId,
      input.suggestedPrice,
    );
    revalidate();
    revalidatePath("/dashboard/products");
    return ok({ message: "Menu price updated.", dashboard });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function startDynamicPricingAbTestAction(productId: string, liftPercent?: number) {
  try {
    const { dataUserId } = await requireTenantActor();
    const dashboard = await startDynamicPricingAbTest(dataUserId, productId, liftPercent ?? 5);
    revalidate();
    return ok({ message: "A/B test started — variant B price active for new orders.", dashboard });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function endDynamicPricingAbTestAction(testId: string) {
  try {
    const { dataUserId } = await requireTenantActor();
    const dashboard = await endDynamicPricingAbTest(dataUserId, testId);
    revalidate();
    return ok({ message: "Experiment ended.", dashboard });
  } catch (e) {
    return fail(safeError(e));
  }
}
