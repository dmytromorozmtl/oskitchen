import { addYears, startOfDay } from "date-fns";
import type { MenuStrategy } from "@prisma/client";

import { saveKitchenModulePreferences } from "@/actions/module-preferences";
import { getMenuTemplate } from "@/services/onboarding/menu-templates";
import { getBusinessModeExperience, type MenuStrategyId } from "@/lib/business-mode-registry";
import {
  quickStartChannelsToIntents,
  quickStartFinishUrl,
  resolveQuickStartModuleKeys,
} from "@/lib/onboarding/quick-start-channels";
import type {
  OnboardingMenuTemplateId,
  QuickStartApplyResult,
  QuickStartConfig,
  QuickStartMenuItemInput,
} from "@/lib/onboarding/quick-start-types";
import {
  mapOperatingModelToWorkflowId,
} from "@/lib/onboarding/onboarding-business-modes";
import { mergeAdaptive, persistAdaptiveJson } from "@/services/onboarding/onboarding-service";
import { ensureCatalogMenu } from "@/lib/products/ensure-catalog-menu";
import { menuCreateBaseForOwner } from "@/lib/products/menu-create-base";
import {
  getOperatingModeForBusinessType,
  operatingModeFromOperatingModelId,
  toPrismaOperatingMode,
} from "@/lib/operating-modes/resolver";
import { mergePosSettings } from "@/lib/pos/pos-settings";
import { MODULE_KEYS } from "@/lib/module-visibility";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

function defaultBusinessName(templateTitle: string): string {
  return `My ${templateTitle.split(" ")[0] ?? "Kitchen"}`;
}

function prismaMenuStrategy(strategyId: MenuStrategyId): MenuStrategy {
  switch (strategyId) {
    case "DAILY_MENU":
      return "DAILY_MENU";
    case "SEASONAL_MENU":
      return "SEASONAL_MENU";
    case "EVENT_MENU":
      return "EVENT_MENU";
    case "CATERING_MENU":
      return "CATERING_PACKAGES";
    case "DRINKS_MENU":
      return "DRINKS_MENU";
    case "BAKERY_PREORDER":
      return "BAKERY_PREORDER";
    case "SPECIALS_MENU":
      return "CAFE_SPECIALS";
    case "MULTI_BRAND_MENU":
      return "MULTI_BRAND_MENU";
    case "WEEKLY_PREORDER":
    default:
      return "WEEKLY_PREORDER";
  }
}

export async function createMenuFromTemplate(
  ownerUserId: string,
  config: Pick<QuickStartConfig, "restaurantType" | "skipTemplateItems">,
): Promise<{ menuId: string; itemsCreated: number }> {
  return createMenuFromOnboardingTemplate(ownerUserId, config.restaurantType, {
    skipTemplateItems: config.skipTemplateItems,
  });
}

export async function createMenuFromOnboardingTemplate(
  ownerUserId: string,
  templateId: OnboardingMenuTemplateId,
  options?: { skipTemplateItems?: boolean },
): Promise<{ menuId: string; itemsCreated: number }> {
  const template = getMenuTemplate(templateId);
  const base = await menuCreateBaseForOwner(ownerUserId);
  const today = startOfDay(new Date());
  const end = addYears(today, 1);

  const menu = await prisma.menu.create({
    data: {
      ...base,
      title: template.menuTitle,
      strategy: prismaMenuStrategy(
        getBusinessModeExperience(template.businessType).defaultMenuStrategy,
      ),
      startDate: today,
      endDate: end,
      preorderDeadline: today,
      active: true,
      published: true,
      sortOrder: 0,
      catalogOnly: false,
    },
  });

  let itemsCreated = 0;
  if (!options?.skipTemplateItems) {
    const operatingMode = getOperatingModeForBusinessType(template.businessType);
    const isDaily = operatingMode === "DAILY_SERVICE";
    for (let i = 0; i < template.items.length; i++) {
      const item = template.items[i]!;
      const product = await prisma.product.create({
        data: {
          menuId: menu.id,
          workspaceId: base.workspaceId,
          title: item.name,
          description: item.description ?? null,
          category: item.category,
          price: item.price,
          preparedDate: today,
          pickupDate: isDaily ? null : today,
          deliveryAvailable: false,
          active: true,
          storefrontVisible: true,
          posVisible: true,
          sortOrder: i,
        },
      });
      if (!isDaily) {
        await prisma.productionTask.create({ data: { productId: product.id } });
      }
      itemsCreated += 1;
    }
  }

  return { menuId: menu.id, itemsCreated };
}

export async function applyOnboardingMenuTemplate(
  ownerUserId: string,
  templateId: OnboardingMenuTemplateId,
): Promise<{ menuId: string; productCount: number }> {
  const { menuId, itemsCreated } = await createMenuFromOnboardingTemplate(ownerUserId, templateId);
  return { menuId, productCount: itemsCreated };
}

export async function createQuickStartMenuItems(
  ownerUserId: string,
  menuId: string,
  items: QuickStartMenuItemInput[],
  businessType: QuickStartConfig["restaurantType"],
): Promise<number> {
  if (items.length === 0) return 0;
  const template = getMenuTemplate(businessType);
  const base = await menuCreateBaseForOwner(ownerUserId);
  const operatingMode = getOperatingModeForBusinessType(template.businessType);
  const isDaily = operatingMode === "DAILY_SERVICE";
  const today = startOfDay(new Date());
  const existingCount = await prisma.product.count({ where: { menuId } });

  let created = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    const product = await prisma.product.create({
      data: {
        menuId,
        workspaceId: base.workspaceId,
        title: item.name.trim(),
        description: null,
        category: item.category.trim().toUpperCase() || "OTHER",
        price: item.price,
        preparedDate: today,
        pickupDate: isDaily ? null : today,
        deliveryAvailable: false,
        active: true,
        storefrontVisible: true,
        posVisible: true,
        sortOrder: existingCount + i,
      },
    });
    if (!isDaily) {
      await prisma.productionTask.create({ data: { productId: product.id } });
    }
    created += 1;
  }
  return created;
}

export async function enableModulesForQuickStart(
  _ownerUserId: string,
  config: QuickStartConfig,
): Promise<{ enabledModuleKeys: ReturnType<typeof resolveQuickStartModuleKeys> }> {
  const template = getMenuTemplate(config.restaurantType);
  const enabledKeys = resolveQuickStartModuleKeys(template.businessType, config.channels);
  const enabledSet = new Set(enabledKeys);
  const modules = MODULE_KEYS.map((key) => ({
    key,
    enabled: enabledSet.has(key),
  }));
  await saveKitchenModulePreferences({ modules });
  return { enabledModuleKeys: enabledKeys };
}

export async function configureKDSLayout(
  ownerUserId: string,
  operatingModel: QuickStartConfig["restaurantType"],
): Promise<void> {
  const template = getMenuTemplate(operatingModel);
  const workflowId = mapOperatingModelToWorkflowId(template.operatingModel);
  await prisma.kitchenSettings.update({
    where: { userId: ownerUserId },
    data: { kitchenWorkflowDefault: workflowId },
  });
}

export async function configurePOSDefaults(ownerUserId: string): Promise<void> {
  const settings = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { posSettingsJson: true },
  });
  const merged = mergePosSettings(settings?.posSettingsJson);
  await prisma.kitchenSettings.update({
    where: { userId: ownerUserId },
    data: {
      posSettingsJson: {
        ...merged,
        offlineQueueEnabled: true,
      },
    },
  });
}

export async function completeQuickStartOnboarding(
  ownerUserId: string,
  sessionUserId: string,
  config: QuickStartConfig,
): Promise<void> {
  const template = getMenuTemplate(config.restaurantType);
  const channelIntents = quickStartChannelsToIntents(config.channels);
  const adaptive = mergeAdaptive(null, {
    operatingModel: template.operatingModel,
    selectedChannelIntents: channelIntents,
    selectedModuleKeys: resolveQuickStartModuleKeys(template.businessType, config.channels),
    completedStepIds: [
      "welcome",
      "business_profile",
      "operating_model",
      "menu_items",
      "sales_channels",
      "recommended_modules",
      "finish",
    ],
    skippedStepIds: ["fulfillment", "weekly_menu", "brands_locations"],
    setupTasks: [
      {
        id: "first_pos_order",
        title: "Take your first POS order",
        href: "/dashboard/pos/terminal?welcome=true",
        priority: "high",
      },
    ],
  });
  await persistAdaptiveJson(ownerUserId, adaptive);
  await prisma.userProfile.update({
    where: { id: sessionUserId },
    data: {
      onboardingCompleted: true,
      onboardingStep: 99,
      companyName: config.businessName?.trim() || undefined,
    },
  });
}

export async function applyQuickStartTemplate(
  ownerUserId: string,
  sessionUserId: string,
  config: QuickStartConfig,
): Promise<QuickStartApplyResult> {
  const template = getMenuTemplate(config.restaurantType);
  const operatingMode = operatingModeFromOperatingModelId(template.operatingModel);
  const businessName = config.businessName?.trim() || defaultBusinessName(template.title);

  await prisma.kitchenSettings.upsert({
    where: { userId: ownerUserId },
    create: {
      userId: ownerUserId,
      workspaceId: (await resolveOwnerWorkspaceId(ownerUserId)) ?? undefined,
      businessName,
      businessType: template.businessType,
      operatingMode: toPrismaOperatingMode(operatingMode),
      kitchenWorkflowDefault: mapOperatingModelToWorkflowId(template.operatingModel),
    },
    update: {
      businessName,
      businessType: template.businessType,
      operatingMode: toPrismaOperatingMode(operatingMode),
      kitchenWorkflowDefault: mapOperatingModelToWorkflowId(template.operatingModel),
    },
  });

  await ensureCatalogMenu(ownerUserId);
  const { menuId, itemsCreated: templateCount } = await createMenuFromTemplate(ownerUserId, config);
  const customCount = await createQuickStartMenuItems(
    ownerUserId,
    menuId,
    config.firstItems,
    config.restaurantType,
  );

  const wantsPos =
    config.channels.includes("pos") || config.channels.includes("all");
  if (wantsPos) {
    await configurePOSDefaults(ownerUserId);
  }
  await configureKDSLayout(ownerUserId, config.restaurantType);
  const { enabledModuleKeys } = await enableModulesForQuickStart(ownerUserId, config);
  await completeQuickStartOnboarding(ownerUserId, sessionUserId, config);

  const channelIntents = quickStartChannelsToIntents(config.channels);
  const nextUrl = quickStartFinishUrl(config.channels, template.operatingModel);

  return {
    success: true,
    nextUrl,
    menuId,
    productCount: templateCount + customCount,
    enabledModuleKeys,
    channelIntents,
  };
}
