import type { Prisma } from "@prisma/client";

import {
  mapOperatingModelToWorkflowId,
} from "@/lib/onboarding/onboarding-business-modes";
import type {
  AutoOnboardingAnswers,
  AutoOnboardingApplyResult,
  AutoOnboardingCuisine,
  AutoOnboardingPlan,
} from "@/lib/onboarding/auto-onboarding-types";
import {
  quickStartChannelsToIntents,
  quickStartFinishUrl,
  resolveQuickStartModuleKeys,
} from "@/lib/onboarding/quick-start-channels";
import type {
  OnboardingMenuTemplateId,
  QuickStartChannel,
  QuickStartConfig,
  QuickStartRestaurantType,
} from "@/lib/onboarding/quick-start-types";
import { getMenuTemplate } from "@/services/onboarding/menu-templates";
import { mergeAdaptive, persistAdaptiveJson } from "@/services/onboarding/onboarding-service";
import {
  applyQuickStartTemplate,
  createMenuFromOnboardingTemplate,
  configureKDSLayout,
  configurePOSDefaults,
  createQuickStartMenuItems,
  enableModulesForQuickStart,
  completeQuickStartOnboarding,
} from "@/services/onboarding/quick-start-service";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { optionalAiNarrative } from "@/services/ai/copilot";

const QUICK_START_TYPES = new Set<QuickStartRestaurantType>([
  "full_service",
  "qsr",
  "bakery",
  "bar",
  "ghost_kitchen",
  "catering",
  "food_truck",
]);

export function mapCuisineToMenuTemplateId(
  cuisine: AutoOnboardingCuisine,
): OnboardingMenuTemplateId {
  if (cuisine === "pizza" || cuisine === "sushi" || cuisine === "coffee_shop") {
    return cuisine;
  }
  return cuisine;
}

export function mapCuisineToQuickStartType(
  cuisine: AutoOnboardingCuisine,
): QuickStartRestaurantType {
  if (QUICK_START_TYPES.has(cuisine as QuickStartRestaurantType)) {
    return cuisine as QuickStartRestaurantType;
  }
  if (cuisine === "pizza") return "qsr";
  if (cuisine === "sushi") return "full_service";
  return "bakery";
}

export function resolveChannelsFromAnswers(answers: AutoOnboardingAnswers): QuickStartChannel[] {
  const channels: QuickStartChannel[] = ["pos"];
  if (answers.delivers) {
    channels.push("delivery_apps", "website");
  } else if (answers.seatCount <= 20) {
    channels.push("qr");
  } else {
    channels.push("website");
  }
  if (answers.seatCount >= 80) {
    return ["all"];
  }
  return [...new Set(channels)];
}

function resolveTaxRatePercent(answers: AutoOnboardingAnswers): number {
  const special = answers.specialRequirements.toLowerCase();
  if (special.includes("tax exempt") || special.includes("no tax")) return 0;
  if (special.includes("uk") || special.includes("vat")) return 20;
  if (answers.cuisine === "catering") return 8.25;
  return 8.875;
}

function priceAdjustmentNote(aov: number): string | null {
  if (aov >= 35) return "Menu prices left at template defaults — your AOV is premium; review and raise prices.";
  if (aov > 0 && aov < 12) return "Consider lowering template prices — your target AOV is under $12.";
  return null;
}

function computeConfidenceScore(answers: AutoOnboardingAnswers): number {
  let score = 72;
  if (answers.businessName.trim().length > 2) score += 8;
  if (answers.averageOrderValue > 0) score += 8;
  if (answers.seatCount > 0) score += 6;
  if (answers.specialRequirements.trim().length > 10) score += 6;
  return Math.min(96, score);
}

async function loadSuggestedVendors(limit = 3): Promise<AutoOnboardingPlan["suggestedVendors"]> {
  const vendors = await prisma.vendor.findMany({
    where: { status: "APPROVED" },
    select: { id: true, companyName: true, type: true },
    orderBy: { verifiedAt: "desc" },
    take: limit,
  });
  return vendors.map((v) => ({
    id: v.id,
    name: v.companyName,
    category: String(v.type).replace(/_/g, " "),
  }));
}

export async function generateAutoOnboardingPlan(
  answers: AutoOnboardingAnswers,
  opts?: { openAiApiKey?: string },
): Promise<AutoOnboardingPlan> {
  const menuTemplateId = mapCuisineToMenuTemplateId(answers.cuisine);
  const restaurantType = mapCuisineToQuickStartType(answers.cuisine);
  const template = getMenuTemplate(menuTemplateId);
  const channels = resolveChannelsFromAnswers(answers);
  const businessName =
    answers.businessName.trim() ||
    `My ${template.title.split(" ")[0] ?? "Restaurant"}`;
  const workflowId = mapOperatingModelToWorkflowId(template.operatingModel);
  const suggestedVendors = await loadSuggestedVendors();

  const setupSteps = [
    { id: "menu", label: `Create menu from ${template.title} template (${template.items.length} items)` },
    { id: "kds", label: `Configure KDS workflow: ${workflowId}` },
    { id: "modules", label: `Enable modules for ${channels.join(", ")}` },
    { id: "tax", label: `Set default tax to ${resolveTaxRatePercent(answers)}%` },
  ];
  if (suggestedVendors.length > 0) {
    setupSteps.push({
      id: "vendors",
      label: `Suggest ${suggestedVendors.length} marketplace suppliers to review`,
    });
  }

  let summary = `AI-assisted setup for ${businessName}: ${template.title}, ${channels.join(" + ")} channels, ${answers.seatCount} seats.`;
  if (answers.delivers) summary += " Delivery channels enabled.";
  const ai = await optionalAiNarrative({
    apiKey: opts?.openAiApiKey,
    bulletSummary: summary,
  });
  if (ai) summary = `${summary} ${ai}`;

  return {
    version: "auto-onboarding-v1",
    confidenceScore: computeConfidenceScore(answers),
    honestyLabel: "AI-assisted",
    restaurantType,
    menuTemplateId,
    channels,
    businessName,
    menuItemCount: template.items.length,
    menuTemplateTitle: template.title,
    kdsWorkflowLabel: workflowId,
    taxRatePercent: resolveTaxRatePercent(answers),
    priceAdjustmentNote: priceAdjustmentNote(answers.averageOrderValue),
    suggestedVendors,
    setupSteps,
    summary,
  };
}

function buildQuickStartConfig(plan: AutoOnboardingPlan): QuickStartConfig {
  const template = getMenuTemplate(plan.menuTemplateId);
  const firstItem = template.items[0];
  return {
    restaurantType: plan.restaurantType,
    channels: plan.channels,
    businessName: plan.businessName,
    firstItems: firstItem
      ? [
          {
            name: firstItem.name,
            price: firstItem.price,
            category: firstItem.category,
          },
        ]
      : [{ name: "House special", price: 12, category: "MAINS" }],
    skipTemplateItems: plan.menuTemplateId !== plan.restaurantType,
  };
}

async function applyExtendedMenuTemplate(
  ownerUserId: string,
  plan: AutoOnboardingPlan,
): Promise<{ menuId: string; productCount: number }> {
  const { menuId, productCount } = await createMenuFromOnboardingTemplate(
    ownerUserId,
    plan.menuTemplateId,
  );
  const config = buildQuickStartConfig(plan);
  const custom = await createQuickStartMenuItems(
    ownerUserId,
    menuId,
    config.firstItems,
    config.restaurantType,
  );
  return { menuId, productCount: productCount + custom };
}

export async function applyAutoOnboardingPlan(input: {
  ownerUserId: string;
  sessionUserId: string;
  plan: AutoOnboardingPlan;
  answers: AutoOnboardingAnswers;
}): Promise<AutoOnboardingApplyResult> {
  const { ownerUserId, sessionUserId, plan, answers } = input;
  const config = buildQuickStartConfig(plan);
  const template = getMenuTemplate(plan.menuTemplateId);
  const usesExtendedTemplate = plan.menuTemplateId !== plan.restaurantType;

  let nextUrl: string;
  let menuId: string;
  let productCount: number;

  if (usesExtendedTemplate) {
    const workspaceId = await resolveOwnerWorkspaceId(ownerUserId);
    await prisma.kitchenSettings.upsert({
      where: { userId: ownerUserId },
      create: {
        userId: ownerUserId,
        workspaceId: workspaceId ?? undefined,
        businessName: plan.businessName,
        businessType: template.businessType,
        defaultTaxRate: plan.taxRatePercent,
        taxDisplayName: "Sales tax",
      },
      update: {
        businessName: plan.businessName,
        businessType: template.businessType,
        defaultTaxRate: plan.taxRatePercent,
      },
    });

    const created = await applyExtendedMenuTemplate(ownerUserId, plan);
    menuId = created.menuId;
    productCount = created.productCount;

    if (config.channels.includes("pos") || config.channels.includes("all")) {
      await configurePOSDefaults(ownerUserId);
    }
    await configureKDSLayout(ownerUserId, config.restaurantType);
    await enableModulesForQuickStart(ownerUserId, config);
    await completeQuickStartOnboarding(ownerUserId, sessionUserId, config);

    const channelIntents = quickStartChannelsToIntents(config.channels);
    nextUrl = quickStartFinishUrl(config.channels, template.operatingModel);

    const adaptive = mergeAdaptive(null, {
      operatingModel: template.operatingModel,
      selectedChannelIntents: channelIntents,
      selectedModuleKeys: resolveQuickStartModuleKeys(template.businessType, config.channels),
    });
    await persistAdaptiveJson(ownerUserId, adaptive);
    await persistAutoOnboardingMetadata(ownerUserId, { answers, plan });
  } else {
    await prisma.kitchenSettings.updateMany({
      where: { userId: ownerUserId },
      data: {
        defaultTaxRate: plan.taxRatePercent,
        taxDisplayName: "Sales tax",
      },
    });

    const result = await applyQuickStartTemplate(ownerUserId, sessionUserId, config);
    nextUrl = result.nextUrl;
    menuId = result.menuId;
    productCount = result.productCount;

    await persistAutoOnboardingMetadata(ownerUserId, { answers, plan });
  }

  return {
    success: true,
    nextUrl,
    menuId,
    productCount,
  };
}

async function persistAutoOnboardingMetadata(
  ownerUserId: string,
  data: { answers: AutoOnboardingAnswers; plan: AutoOnboardingPlan },
): Promise<void> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  const base =
    kitchen?.settingsCenterJson && typeof kitchen.settingsCenterJson === "object"
      ? { ...(kitchen.settingsCenterJson as Record<string, unknown>) }
      : {};
  base.autoOnboarding = {
    answers: data.answers,
    plan: data.plan,
    suggestedVendorIds: data.plan.suggestedVendors.map((v) => v.id),
    appliedAt: new Date().toISOString(),
  };
  await prisma.kitchenSettings.update({
    where: { userId: ownerUserId },
    data: { settingsCenterJson: base as Prisma.InputJsonValue },
  });
}

export function parseAutoOnboardingAnswers(raw: {
  cuisine: string;
  seatCount: number | string;
  delivers: boolean | string;
  averageOrderValue: number | string;
  specialRequirements?: string;
  businessName?: string;
}): AutoOnboardingAnswers {
  const cuisine = raw.cuisine as AutoOnboardingCuisine;
  return {
    cuisine,
    seatCount: Math.max(0, Math.round(Number(raw.seatCount) || 0)),
    delivers: raw.delivers === true || raw.delivers === "true",
    averageOrderValue: Math.max(0, Number(raw.averageOrderValue) || 0),
    specialRequirements: String(raw.specialRequirements ?? "").trim().slice(0, 500),
    businessName: String(raw.businessName ?? "").trim().slice(0, 200),
  };
}
