"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { saveKitchenModulePreferences } from "@/actions/module-preferences";
import { recordAuditLog } from "@/lib/audit-log";
import { recordLifecycleEventSafe } from "@/lib/lifecycle-events";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  businessNameSchema,
  currencySchema,
  localeSchema,
  timezoneSchema,
} from "@/lib/onboarding/onboarding-validation";
import type {
  OnboardingAdaptiveState,
  OnboardingChannelIntent,
  OnboardingStepId,
  OperatingModelId,
} from "@/lib/onboarding/onboarding-types";
import { prisma } from "@/lib/prisma";
import { MODULE_KEYS, type ModuleKey } from "@/lib/module-visibility";
import {
  getOperatingModeForBusinessType,
  operatingModeFromOperatingModelId,
  toPrismaOperatingMode,
} from "@/lib/operating-modes/resolver";
import { safeError } from "@/lib/security";
import {
  advanceOnboardingStepIndex,
  buildSetupTasks,
  computeFinishRedirect,
  ensureServiceMenu,
  flowForUser,
  mapOperatingModelToWorkflowId,
  markStepCompleted,
  markStepSkipped,
  mergeAdaptive,
  parseOnboardingAdaptive,
  persistAdaptiveJson,
} from "@/services/onboarding/onboarding-service";
import { BusinessType, IntegrationProvider, Prisma, ProductCategory } from "@prisma/client";

const OPERATING_MODELS = [
  "WALK_IN_DAILY",
  "PICKUP",
  "DELIVERY",
  "WEEKLY_PREORDERS",
  "CATERING_QUOTES_EVENTS",
  "BAKERY_CUSTOM_PREORDERS",
  "STOREFRONT",
  "SHOPIFY_WOO_MARKETPLACE",
  "MANUAL_ONLY",
] as const satisfies readonly OperatingModelId[];

const operatingModelSchema = z.enum(OPERATING_MODELS);

const step1Schema = z.object({
  businessName: businessNameSchema,
  businessType: z.nativeEnum(BusinessType),
  country: z.string().trim().min(1, "Please select a country").max(120),
  timezone: timezoneSchema,
  currency: currencySchema,
  locale: localeSchema,
  kitchenWorkflowDefault: z.string().trim().max(120).optional().or(z.literal("")),
  locationsCount: z.coerce.number().int().min(1).max(9999).optional(),
  brandsCount: z.coerce.number().int().min(0).max(9999).optional(),
});

const step2Schema = z.object({
  pickupAddress: z.string().trim().max(5000).optional().or(z.literal("")),
  deliveryEnabled: z.coerce.boolean(),
  deliveryRadiusKm: z.coerce.number().int().min(0).max(500).optional(),
  orderCutoffTime: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((s) => !s || /^([01]\d|2[0-3]):[0-5]\d$/.test(s), "Use HH:mm"),
  pickupWindows: z.string().trim().max(5000).optional().or(z.literal("")),
});

const step3Schema = z.object({
  menuTitle: z.string().trim().min(1).max(200),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  preorderDeadline: z.string().min(1),
});

function stepIdFromForm(formData: FormData): OnboardingStepId | null {
  const v = String(formData.get("currentStepId") ?? "").trim();
  const allowed: OnboardingStepId[] = [
    "welcome",
    "business_profile",
    "operating_model",
    "brands_locations",
    "fulfillment",
    "weekly_menu",
    "menu_items",
    "sales_channels",
    "recommended_modules",
    "finish",
  ];
  return (allowed as string[]).includes(v) ? (v as OnboardingStepId) : null;
}

async function loadFlowContext(userId: string) {
  const settings = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: {
      businessType: true,
      onboardingAdaptiveJson: true,
    },
  });
  const flow = flowForUser({
    businessType: settings?.businessType ?? null,
    onboardingAdaptiveJson: settings?.onboardingAdaptiveJson ?? null,
  });
  const adaptive = parseOnboardingAdaptive(settings?.onboardingAdaptiveJson ?? null);
  return { flow, adaptive, businessType: settings?.businessType ?? null };
}

async function afterSaveSuccess(
  sessionUserId: string,
  dataUserId: string,
  stepId: OnboardingStepId | null,
) {
  if (!stepId) return;
  const { flow } = await loadFlowContext(dataUserId);
  await advanceOnboardingStepIndex(sessionUserId, flow.stepIds, stepId);
  await markStepCompleted(dataUserId, stepId);
}

async function afterSkipSuccess(
  sessionUserId: string,
  dataUserId: string,
  stepId: OnboardingStepId | null,
) {
  if (!stepId) return;
  await markStepSkipped(dataUserId, stepId);
  const { flow } = await loadFlowContext(dataUserId);
  await advanceOnboardingStepIndex(sessionUserId, flow.stepIds, stepId);
}

async function getAdaptive(userId: string): Promise<OnboardingAdaptiveState | null> {
  const s = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { onboardingAdaptiveJson: true },
  });
  return parseOnboardingAdaptive(s?.onboardingAdaptiveJson ?? null);
}

async function patchAdaptive(userId: string, patch: Partial<Omit<OnboardingAdaptiveState, "schemaVersion">>) {
  const prev = await getAdaptive(userId);
  await persistAdaptiveJson(userId, mergeAdaptive(prev, patch));
}

async function requireOnboardingManageAccess(operation: string) {
  const access = await requireMutationPermission("workspace.settings");
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "onboarding.permission_denied",
      entityType: "KitchenSettings",
      metadata: { operation, requiredPermission: "workspace.settings" },
    });
    return { ok: false as const, error: access.error };
  }
  const actor = await requireTenantActor();
  return { ok: true as const, ...actor };
}

export async function onboardingSaveWelcome(formData: FormData) {
  try {
    const manage = await requireOnboardingManageAccess("onboarding.save_welcome");
    if (!manage.ok) return { error: manage.error };
    const { sessionUser: user, dataUserId } = manage;
    const skip = String(formData.get("skipSetup") ?? "") === "1";
    if (skip) {
      await patchAdaptive(dataUserId, {
        welcomeSeenAt: new Date().toISOString(),
        skippedFromWelcome: true,
      });
      return onboardingSkipToDashboard();
    }
    await patchAdaptive(dataUserId, { welcomeSeenAt: new Date().toISOString() });
    await afterSaveSuccess(user.id, dataUserId, "welcome");
    revalidatePath("/onboarding");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function onboardingSaveOperatingModel(formData: FormData) {
  try {
    const manage = await requireOnboardingManageAccess("onboarding.save_operating_model");
    if (!manage.ok) return { error: manage.error };
    const { sessionUser: user, dataUserId } = manage;
    const parsed = operatingModelSchema.safeParse(String(formData.get("operatingModel") ?? ""));
    if (!parsed.success) return { error: "Choose how you take orders." };
    const op = parsed.data;
    const workflowId = mapOperatingModelToWorkflowId(op);
    await prisma.kitchenSettings.update({
      where: { userId: dataUserId },
      data: {
        kitchenWorkflowDefault: workflowId,
        operatingMode: toPrismaOperatingMode(operatingModeFromOperatingModelId(op)),
      },
    });
    await patchAdaptive(dataUserId, { operatingModel: op });
    await afterSaveSuccess(user.id, dataUserId, "operating_model");
    revalidatePath("/onboarding");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function onboardingSaveBrandsLocations(formData: FormData) {
  try {
    const manage = await requireOnboardingManageAccess("onboarding.save_brands_locations");
    if (!manage.ok) return { error: manage.error };
    const { sessionUser: user, dataUserId } = manage;
    const locations = z.coerce.number().int().min(1).max(9999).safeParse(formData.get("locationsCount"));
    const brands = z.coerce.number().int().min(0).max(9999).safeParse(formData.get("brandsCount"));
    await patchAdaptive(dataUserId, {
      locationsCount: locations.success ? locations.data : undefined,
      brandsCount: brands.success ? brands.data : undefined,
    });
    await afterSaveSuccess(user.id, dataUserId, "brands_locations");
    revalidatePath("/onboarding");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function onboardingSaveStep1(formData: FormData) {
  try {
    const manage = await requireOnboardingManageAccess("onboarding.save_step1");
    if (!manage.ok) return { error: manage.error };
    const { sessionUser: user, dataUserId } = manage;
    const parsed = step1Schema.safeParse({
      businessName: formData.get("businessName"),
      businessType: formData.get("businessType"),
      country: formData.get("country"),
      timezone: formData.get("timezone"),
      currency: formData.get("currency"),
      locale: formData.get("locale"),
      kitchenWorkflowDefault: formData.get("kitchenWorkflowDefault"),
      locationsCount: formData.get("locationsCount") || undefined,
      brandsCount: formData.get("brandsCount") || undefined,
    });
    if (!parsed.success) {
      const msg =
        parsed.error.flatten().fieldErrors.timezone?.[0] ??
        parsed.error.flatten().fieldErrors.currency?.[0] ??
        parsed.error.flatten().fieldErrors.businessName?.[0] ??
        "Invalid step";
      return { error: msg };
    }
    const d = parsed.data;
    const operatingMode = getOperatingModeForBusinessType(d.businessType);
    await prisma.kitchenSettings.update({
      where: { userId: dataUserId },
      data: {
        businessName: d.businessName,
        businessType: d.businessType,
        operatingMode,
        country: d.country?.trim() || null,
        timezone: d.timezone,
        currency: d.currency,
        locale: d.locale,
        kitchenWorkflowDefault: d.kitchenWorkflowDefault?.trim() || null,
      },
    });
    await patchAdaptive(dataUserId, {
      locationsCount: d.locationsCount,
      brandsCount: d.brandsCount,
    });
    void recordLifecycleEventSafe(user.id, "onboarding_started");
    await afterSaveSuccess(user.id, dataUserId, "business_profile");
    revalidatePath("/onboarding");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

async function currentStep(userId: string) {
  const p = await prisma.userProfile.findUnique({
    where: { id: userId },
    select: { onboardingStep: true },
  });
  return p?.onboardingStep ?? 0;
}

export async function onboardingSaveStep2(formData: FormData) {
  try {
    const manage = await requireOnboardingManageAccess("onboarding.save_step2");
    if (!manage.ok) return { error: manage.error };
    const { sessionUser: user, dataUserId } = manage;
    const parsed = step2Schema.safeParse({
      pickupAddress: formData.get("pickupAddress"),
      deliveryEnabled: formData.get("deliveryEnabled") === "on",
      deliveryRadiusKm: formData.get("deliveryRadiusKm") || undefined,
      orderCutoffTime: formData.get("orderCutoffTime"),
      pickupWindows: formData.get("pickupWindows"),
    });
    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors.orderCutoffTime?.[0] ?? "Invalid step" };
    }
    const d = parsed.data;
    await prisma.kitchenSettings.update({
      where: { userId: dataUserId },
      data: {
        pickupAddress: d.pickupAddress?.trim() || null,
        deliveryEnabled: d.deliveryEnabled,
        deliveryRadiusKm: d.deliveryRadiusKm ?? undefined,
        orderCutoffTime: d.orderCutoffTime?.trim() || null,
        pickupWindows: d.pickupWindows?.trim() || null,
      },
    });
    await afterSaveSuccess(user.id, dataUserId, "fulfillment");
    revalidatePath("/onboarding");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function onboardingSaveStep3Menu(formData: FormData) {
  try {
    const manage = await requireOnboardingManageAccess("onboarding.save_step3_menu");
    if (!manage.ok) return { error: manage.error };
    const { sessionUser: user, dataUserId } = manage;
    const parsed = step3Schema.safeParse({
      menuTitle: formData.get("menuTitle"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      preorderDeadline: formData.get("preorderDeadline"),
    });
    if (!parsed.success) {
      return { error: "Check your menu dates" };
    }
    const d = parsed.data;
    const start = new Date(d.startDate);
    const end = new Date(d.endDate);
    const pre = new Date(d.preorderDeadline);
    if (end < start) return { error: "End date must be after start date" };

    const { menuCreateBaseForOwner } = await import("@/lib/products/menu-create-base");
    const menuBase = await menuCreateBaseForOwner(dataUserId);
    const menu = await prisma.menu.create({
      data: {
        ...menuBase,
        title: d.menuTitle,
        startDate: start,
        endDate: end,
        preorderDeadline: pre,
        active: true,
        sortOrder: 0,
      },
    });
    await afterSaveSuccess(user.id, dataUserId, "weekly_menu");
    revalidatePath("/onboarding");
    return { ok: true as const, menuId: menu.id };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function onboardingSaveStep4Products(formData: FormData) {
  try {
    const manage = await requireOnboardingManageAccess("onboarding.save_step4_products");
    if (!manage.ok) return { error: manage.error };
    const { sessionUser: user, dataUserId } = manage;
    const menuId = String(formData.get("menuId") ?? "");
    const mode = String(formData.get("mode") ?? "skip");

    if (mode === "skip") {
      await afterSaveSuccess(user.id, dataUserId, "menu_items");
      revalidatePath("/onboarding");
      return { ok: true as const };
    }

    let resolvedMenuId = menuId;
    if (!resolvedMenuId) {
      resolvedMenuId = await ensureServiceMenu(dataUserId);
    }

    const menu = await prisma.menu.findFirst({
      where: { id: resolvedMenuId, userId: dataUserId },
    });
    if (!menu) return { error: "Menu not found" };

    if (mode === "demo") {
      const base = new Date(menu.startDate);
      const samples = [
        {
          title: "Signature protein bowl",
          category: ProductCategory.MAINS,
          price: 16.5,
          description: "Roasted chicken, grains, seasonal veg, citrus dressing.",
        },
        {
          title: "Vegetarian lasagna",
          category: ProductCategory.MAINS,
          price: 14,
          description: "House marinara, ricotta, spinach, mozzarella.",
        },
        {
          title: "Seasonal soup quart",
          category: ProductCategory.SIDES,
          price: 12,
          description: "Chef’s batch soup — check label for flavor.",
        },
      ];
      for (let i = 0; i < samples.length; i++) {
        const s = samples[i];
        const product = await prisma.product.create({
          data: {
            menuId: menu.id,
            title: s.title,
            description: s.description,
            category: s.category,
            preparedDate: base,
            pickupDate: base,
            deliveryAvailable: true,
            active: true,
            price: s.price,
            sortOrder: i,
          },
        });
        await prisma.productionTask.create({
          data: { productId: product.id },
        });
      }
    }

    await afterSaveSuccess(user.id, dataUserId, "menu_items");
    revalidatePath("/onboarding");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function onboardingSkipWeeklyMenu() {
  try {
    const manage = await requireOnboardingManageAccess("onboarding.skip_weekly_menu");
    if (!manage.ok) return { error: manage.error };
    const { sessionUser: user, dataUserId } = manage;
    await markStepSkipped(dataUserId, "weekly_menu");
    await afterSkipSuccess(user.id, dataUserId, "weekly_menu");
    revalidatePath("/onboarding");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

function intentFromForm(formData: FormData): OnboardingChannelIntent[] {
  const intents: OnboardingChannelIntent[] = ["manual"];
  const map: [string, OnboardingChannelIntent][] = [
    ["ch_storefront", "storefront"],
    ["ch_woocommerce", "woocommerce"],
    ["ch_shopify", "shopify"],
    ["ch_uber_eats", "uber_eats"],
    ["ch_uber_direct", "uber_direct"],
    ["ch_doordash", "doordash_placeholder"],
    ["ch_csv", "csv_import"],
    ["ch_phone_email", "phone_email"],
    ["ch_catering_quotes", "catering_quotes"],
    ["ch_meal_plan_subscriptions", "meal_plan_subscriptions"],
  ];
  for (const [name, intent] of map) {
    if (formData.get(name) === "on") intents.push(intent);
  }
  return [...new Set(intents)];
}

function manualChannelRow(userId: string, label: string) {
  return {
    userId,
    name: label,
    provider: IntegrationProvider.MANUAL,
    active: true,
    color: "#FF5F1F",
  };
}

export async function onboardingSaveStep5Channels(formData: FormData) {
  try {
    const manage = await requireOnboardingManageAccess("onboarding.save_step5_channels");
    if (!manage.ok) return { error: manage.error };
    const { sessionUser: user, dataUserId, workspaceId } = manage;
    const intents = intentFromForm(formData);
    await patchAdaptive(dataUserId, { selectedChannelIntents: intents });

    await prisma.orderChannel.deleteMany({ where: { userId: dataUserId } });

    const rows: { userId: string; name: string; provider: IntegrationProvider; active: boolean; color?: string }[] =
      [manualChannelRow(dataUserId, "Manual orders")];

    const pushManual = (name: string, color: string) => {
      rows.push({ ...manualChannelRow(dataUserId, name), color });
    };

    if (intents.includes("storefront")) {
      pushManual("Native OS Kitchen storefront (configure next)", "#0ea5e9");
    }
    if (intents.includes("woocommerce")) {
      rows.push({
        userId: dataUserId,
        name: "WooCommerce (connect next)",
        provider: IntegrationProvider.WOOCOMMERCE,
        active: true,
        color: "#7f54b3",
      });
    }
    if (intents.includes("shopify")) {
      rows.push({
        userId: dataUserId,
        name: "Shopify (connect next)",
        provider: IntegrationProvider.SHOPIFY,
        active: true,
        color: "#96bf48",
      });
    }
    if (intents.includes("uber_eats")) {
      rows.push({
        userId: dataUserId,
        name: "Uber Eats (partner access)",
        provider: IntegrationProvider.UBER_EATS,
        active: true,
        color: "#06c167",
      });
    }
    if (intents.includes("uber_direct")) {
      rows.push({
        userId: dataUserId,
        name: "Uber Direct (connect next)",
        provider: IntegrationProvider.UBER_DIRECT,
        active: true,
        color: "#000000",
      });
    }
    if (intents.includes("doordash_placeholder")) {
      pushManual("DoorDash (coming soon)", "#ff3008");
    }
    if (intents.includes("csv_import")) {
      pushManual("CSV import orders", "#64748b");
    }
    if (intents.includes("phone_email")) {
      pushManual("Phone / email orders", "#64748b");
    }
    if (intents.includes("catering_quotes")) {
      pushManual("Catering quotes", "#a855f7");
    }
    if (intents.includes("meal_plan_subscriptions")) {
      pushManual("Meal plan subscriptions", "#22c55e");
    }

    await prisma.orderChannel.createMany({
      data: rows.map((c) => ({
        userId: dataUserId,
        workspaceId: workspaceId ?? undefined,
        name: c.name,
        provider: c.provider,
        active: c.active,
        color: c.color ?? null,
      })),
    });

    await afterSaveSuccess(user.id, dataUserId, "sales_channels");
    revalidatePath("/onboarding");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function onboardingSaveRecommendedModules(formData: FormData) {
  try {
    const manage = await requireOnboardingManageAccess("onboarding.save_recommended_modules");
    if (!manage.ok) return { error: manage.error };
    const { sessionUser: user } = manage;
    const modules: { key: ModuleKey; enabled: boolean }[] = [];
    const entries = [...formData.entries()].filter(([k]) => k.startsWith("module_"));
    for (const [k, v] of entries) {
      const raw = k.replace(/^module_/, "");
      if (!raw || !(MODULE_KEYS as readonly string[]).includes(raw)) continue;
      modules.push({ key: raw as ModuleKey, enabled: v === "on" });
    }
    const keys = entries.filter(([, v]) => v === "on").map(([k]) => k.replace(/^module_/, ""));
    await patchAdaptive(dataUserId, { selectedModuleKeys: keys });
    await afterSaveSuccess(user.id, dataUserId, "recommended_modules");
    revalidatePath("/onboarding");
    if (modules.length > 0) {
      void saveKitchenModulePreferences({ modules }).catch(() => undefined);
    }
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function onboardingComplete() {
  try {
    const manage = await requireOnboardingManageAccess("onboarding.complete");
    if (!manage.ok) return { error: manage.error };
    const { sessionUser: user, dataUserId } = manage;
    const settings = await prisma.kitchenSettings.findUnique({
      where: { userId: dataUserId },
      select: { businessType: true, onboardingAdaptiveJson: true },
    });
    const adaptive = parseOnboardingAdaptive(settings?.onboardingAdaptiveJson ?? null);
    const skipped = adaptive?.skippedStepIds ?? [];
    const channels = adaptive?.selectedChannelIntents ?? ["manual"];
    const tasks = buildSetupTasks({
      businessType: settings?.businessType ?? null,
      operatingModel: adaptive?.operatingModel ?? null,
      channels,
      skippedStepIds: skipped,
    });
    await patchAdaptive(dataUserId, { setupTasks: tasks });
    await markStepCompleted(dataUserId, "finish");
    await prisma.userProfile.update({
      where: { id: user.id },
      data: {
        onboardingCompleted: true,
        onboardingStep: Math.max(await currentStep(user.id), 99),
      },
    });
    const { trackUsageEvent } = await import("@/lib/usage");
    void trackUsageEvent({
      userId: dataUserId,
      eventName: "onboarding_completed",
      route: "/onboarding",
    });
    void recordLifecycleEventSafe(user.id, "onboarding_completed");
    revalidatePath("/dashboard");
    revalidatePath("/onboarding");
    const redirectTo = computeFinishRedirect({
      businessType: settings?.businessType ?? null,
      operatingModel: adaptive?.operatingModel ?? null,
      channels,
    });
    return { ok: true as const, redirectTo };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function reopenOnboardingWizard() {
  try {
    const manage = await requireOnboardingManageAccess("onboarding.reopen_wizard");
    if (!manage.ok) return { error: manage.error };
    const { sessionUser: user, dataUserId } = manage;
    await prisma.userProfile.update({
      where: { id: user.id },
      data: {
        onboardingCompleted: false,
        onboardingStep: 0,
      },
    });
    await prisma.kitchenSettings.update({
      where: { userId: dataUserId },
      data: { onboardingAdaptiveJson: Prisma.DbNull },
    });
    revalidatePath("/dashboard");
    revalidatePath("/onboarding");
    revalidatePath("/dashboard/settings");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function onboardingSkipToDashboard() {
  try {
    const manage = await requireOnboardingManageAccess("onboarding.skip_to_dashboard");
    if (!manage.ok) return { error: manage.error };
    const { sessionUser: user, dataUserId } = manage;
    await prisma.userProfile.update({
      where: { id: user.id },
      data: {
        onboardingCompleted: true,
      },
    });
    const { trackUsageEvent } = await import("@/lib/usage");
    void trackUsageEvent({
      userId: dataUserId,
      eventName: "onboarding_completed",
      route: "/onboarding",
      metadata: { skipped: true },
    });
    void recordLifecycleEventSafe(user.id, "onboarding_completed", {
      skipped: true,
    });
    revalidatePath("/dashboard");
    return { ok: true as const, redirectTo: "/dashboard/today" as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function onboardingSkipStepGeneric(formData: FormData) {
  try {
    const manage = await requireOnboardingManageAccess("onboarding.skip_step");
    if (!manage.ok) return { error: manage.error };
    const { sessionUser: user, dataUserId } = manage;
    const sid = stepIdFromForm(formData);
    if (!sid) return { error: "Missing step" };
    await afterSkipSuccess(user.id, dataUserId, sid);
    revalidatePath("/onboarding");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}
