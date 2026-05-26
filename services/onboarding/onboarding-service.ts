import type { BusinessType, Prisma } from "@prisma/client";

import { buildOnboardingFlow } from "@/lib/onboarding/onboarding-flow-builder";
import {
  defaultOperatingModelForBusinessType,
  mapOperatingModelToWorkflowId,
} from "@/lib/onboarding/onboarding-business-modes";
import type {
  OnboardingAdaptiveState,
  OnboardingChannelIntent,
  OnboardingSetupTask,
  OnboardingStepId,
  OperatingModelId,
} from "@/lib/onboarding/onboarding-types";
import { ONBOARDING_ADAPTIVE_SCHEMA_VERSION } from "@/lib/onboarding/onboarding-types";
import { prisma } from "@/lib/prisma";

/** Legacy linear flow: step index k was the screen shown when `onboardingStep === k` before advance. */
const LEGACY_ORDER: OnboardingStepId[] = [
  "business_profile",
  "fulfillment",
  "weekly_menu",
  "menu_items",
  "sales_channels",
  "finish",
];

const LEGACY_FALLBACK: Partial<Record<OnboardingStepId, OnboardingStepId>> = {
  weekly_menu: "menu_items",
  menu_items: "sales_channels",
  sales_channels: "finish",
};

function findStepIndexForLegacyResume(legacyNextIdx: number, stepIds: readonly OnboardingStepId[]): number {
  const clamped = Math.min(Math.max(legacyNextIdx, 0), LEGACY_ORDER.length - 1);
  let target: OnboardingStepId | undefined = LEGACY_ORDER[clamped];
  let idx = target ? stepIds.indexOf(target) : -1;
  while (idx === -1 && target) {
    target = LEGACY_FALLBACK[target];
    idx = target ? stepIds.indexOf(target) : -1;
  }
  return idx === -1 ? 0 : Math.min(idx, stepIds.length - 1);
}

/** First paint index for the adaptive wizard. */
export function resolveInitialWizardStepIndex(input: {
  onboardingStep: number;
  onboardingCompleted: boolean;
  businessName: string | null | undefined;
  adaptive: OnboardingAdaptiveState | null;
  stepIds: readonly OnboardingStepId[];
}): number {
  if (input.onboardingCompleted) return 0;

  // Adaptive flow: onboardingStep is the index in stepIds (set by advanceOnboardingStepIndex).
  if (input.adaptive) {
    const done = new Set([
      ...(input.adaptive.completedStepIds ?? []),
      ...(input.adaptive.skippedStepIds ?? []),
    ]);
    const fromCounter = Math.min(Math.max(input.onboardingStep, 0), input.stepIds.length - 1);
    if (done.size > 0) {
      const firstIncomplete = input.stepIds.findIndex((id) => !done.has(id));
      if (firstIncomplete >= 0) {
        return Math.max(fromCounter, firstIncomplete);
      }
    }
    return fromCounter;
  }

  // Legacy accounts (pre-adaptive): map old linear step counter onto current flow.
  if (input.onboardingStep >= 6) {
    return Math.max(0, input.stepIds.length - 1);
  }
  if (input.onboardingStep > 0) {
    return findStepIndexForLegacyResume(input.onboardingStep, input.stepIds);
  }
  if (input.businessName?.trim()) {
    const i = input.stepIds.indexOf("business_profile");
    return i >= 0 ? i : 0;
  }
  return 0;
}

export function parseOnboardingAdaptive(raw: unknown): OnboardingAdaptiveState | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.schemaVersion !== ONBOARDING_ADAPTIVE_SCHEMA_VERSION) return null;
  return o as unknown as OnboardingAdaptiveState;
}

export function mergeAdaptive(
  prev: OnboardingAdaptiveState | null,
  patch: Partial<Omit<OnboardingAdaptiveState, "schemaVersion">>,
): OnboardingAdaptiveState {
  return {
    schemaVersion: ONBOARDING_ADAPTIVE_SCHEMA_VERSION,
    ...prev,
    ...patch,
  };
}

export async function persistAdaptiveJson(userId: string, next: OnboardingAdaptiveState) {
  await prisma.kitchenSettings.update({
    where: { userId },
    data: { onboardingAdaptiveJson: next as unknown as Prisma.InputJsonValue },
  });
}

export function flowForUser(settings: {
  businessType: BusinessType | null;
  onboardingAdaptiveJson: unknown;
}) {
  const adaptive = parseOnboardingAdaptive(settings.onboardingAdaptiveJson);
  const operatingModel =
    adaptive?.operatingModel ?? defaultOperatingModelForBusinessType(settings.businessType);
  return buildOnboardingFlow({
    businessType: settings.businessType,
    operatingModel,
  });
}

export async function advanceOnboardingStepIndex(
  userId: string,
  stepIds: readonly OnboardingStepId[],
  currentStepId: OnboardingStepId,
) {
  const idx = stepIds.indexOf(currentStepId);
  const next = idx >= 0 ? Math.min(idx + 1, stepIds.length - 1) : 0;
  await prisma.userProfile.update({
    where: { id: userId },
    data: { onboardingStep: next },
  });
  return next;
}

export async function markStepCompleted(userId: string, stepId: OnboardingStepId) {
  const settings = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { onboardingAdaptiveJson: true },
  });
  const prev = parseOnboardingAdaptive(settings?.onboardingAdaptiveJson);
  const completed = new Set(prev?.completedStepIds ?? []);
  completed.add(stepId);
  await persistAdaptiveJson(
    userId,
    mergeAdaptive(prev, { completedStepIds: [...completed] as OnboardingStepId[] }),
  );
}

export async function markStepSkipped(userId: string, stepId: OnboardingStepId) {
  const settings = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { onboardingAdaptiveJson: true },
  });
  const prev = parseOnboardingAdaptive(settings?.onboardingAdaptiveJson);
  const skipped = new Set(prev?.skippedStepIds ?? []);
  skipped.add(stepId);
  await persistAdaptiveJson(
    userId,
    mergeAdaptive(prev, { skippedStepIds: [...skipped] as OnboardingStepId[] }),
  );
}

export function buildSetupTasks(input: {
  businessType: BusinessType | null;
  operatingModel: OperatingModelId | null;
  channels: OnboardingChannelIntent[];
  skippedStepIds: OnboardingStepId[];
}): OnboardingSetupTask[] {
  const tasks: OnboardingSetupTask[] = [];
  const skipped = new Set(input.skippedStepIds);
  tasks.push({
    id: "today",
    title: "Open Today",
    href: "/dashboard/today",
    priority: "high",
  });
  if (!skipped.has("menu_items")) {
    tasks.push({
      id: "menu_item",
      title: "Create a menu item",
      href: "/dashboard/menus",
      priority: "medium",
    });
  }
  if (input.channels.some((c) => c === "woocommerce" || c === "shopify" || c === "uber_eats")) {
    tasks.push({
      id: "channels",
      title: "Connect a sales channel",
      href: "/dashboard/sales-channels",
      priority: "high",
    });
  }
  if (input.channels.includes("storefront")) {
    tasks.push({
      id: "storefront",
      title: "Configure storefront",
      href: "/dashboard/storefront",
      priority: "high",
    });
  }
  if (skipped.has("weekly_menu") && (input.businessType === "MEAL_PREP" || input.operatingModel === "WEEKLY_PREORDERS")) {
    tasks.push({
      id: "weekly_menu",
      title: "Create a weekly menu when ready",
      href: "/dashboard/menus",
      priority: "medium",
    });
  }
  if (input.operatingModel === "CATERING_QUOTES_EVENTS") {
    tasks.push({
      id: "quotes",
      title: "Review catering quotes",
      href: "/dashboard/catering-quotes",
      priority: "medium",
    });
  }
  tasks.push({
    id: "settings",
    title: "Review Settings",
    href: "/dashboard/settings",
    priority: "low",
  });
  return tasks;
}

export function computeFinishRedirect(input: {
  businessType: BusinessType | null;
  operatingModel: OperatingModelId | null;
  channels: OnboardingChannelIntent[];
}): string {
  if (input.channels.includes("storefront")) return "/dashboard/storefront";
  if (input.channels.some((c) => ["woocommerce", "shopify", "uber_eats", "uber_direct", "doordash_placeholder"].includes(c))) {
    return "/dashboard/sales-channels";
  }
  if (input.operatingModel === "MANUAL_ONLY") return "/dashboard/orders/new";
  if (input.businessType === "MEAL_PREP" || input.operatingModel === "WEEKLY_PREORDERS") {
    return "/dashboard/today";
  }
  return "/dashboard";
}

export async function ensureServiceMenu(userId: string): Promise<string> {
  const { menuListWhereForOwner } = await import("@/lib/scope/workspace-resource-scope");
  const menuWhere = await menuListWhereForOwner(userId);
  const existing = await prisma.menu.findFirst({
    where: menuWhere,
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing.id;
  const { menuCreateBaseForOwner } = await import("@/lib/products/menu-create-base");
  const base = await menuCreateBaseForOwner(userId);
  const start = new Date();
  const end = new Date(start);
  end.setFullYear(end.getFullYear() + 1);
  const menu = await prisma.menu.create({
    data: {
      ...base,
      title: "Main menu",
      startDate: start,
      endDate: end,
      preorderDeadline: start,
      active: true,
      sortOrder: 0,
    },
  });
  return menu.id;
}

export { mapOperatingModelToWorkflowId, defaultOperatingModelForBusinessType };
