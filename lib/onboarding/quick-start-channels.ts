import type { BusinessType } from "@prisma/client";

import { getBusinessModeExperience } from "@/lib/business-mode-registry";
import type { OnboardingChannelIntent, OperatingModelId } from "@/lib/onboarding/onboarding-types";
import type { QuickStartChannel } from "@/lib/onboarding/quick-start-types";
import type { ModuleKey } from "@/lib/module-visibility";
import { MODULE_KEYS } from "@/lib/module-visibility";

const LOCKED: ModuleKey[] = ["dashboard", "today", "settings", "billing", "support"];

const CHANNEL_MODULE_KEYS: Record<QuickStartChannel, ModuleKey[]> = {
  pos: ["pos_terminal", "kitchen_screen", "orders", "order_hub", "products", "menus", "production"],
  qr: ["kitchen_screen", "orders", "order_hub", "products", "menus", "storefront"],
  website: ["storefront", "products", "menus", "orders"],
  delivery_apps: ["integrations", "order_hub", "product_mapping"],
  all: [],
};

/** Map UI channel toggles to persisted onboarding channel intents. */
export function quickStartChannelsToIntents(channels: QuickStartChannel[]): OnboardingChannelIntent[] {
  const set = new Set<OnboardingChannelIntent>(["manual"]);
  const useAll = channels.includes("all");
  if (useAll || channels.includes("website") || channels.includes("qr")) {
    set.add("storefront");
  }
  if (useAll || channels.includes("delivery_apps")) {
    set.add("shopify");
    set.add("doordash_placeholder");
  }
  if (useAll || channels.includes("pos")) {
    set.add("phone_email");
  }
  return [...set];
}

export function resolveQuickStartModuleKeys(
  businessType: BusinessType,
  channels: QuickStartChannel[],
): ModuleKey[] {
  const exp = getBusinessModeExperience(businessType);
  const enabled = new Set<ModuleKey>(LOCKED);

  for (const key of exp.defaultModuleKeys) {
    enabled.add(key);
  }

  const useAll = channels.includes("all");
  if (useAll) {
    for (const key of exp.recommendedModuleKeys) {
      enabled.add(key);
    }
  } else {
    for (const channel of channels) {
      for (const key of CHANNEL_MODULE_KEYS[channel]) {
        enabled.add(key);
      }
    }
  }

  return MODULE_KEYS.filter((key) => enabled.has(key));
}

export function quickStartFinishUrl(
  channels: QuickStartChannel[],
  operatingModel: OperatingModelId,
): string {
  const intents = quickStartChannelsToIntents(channels);
  if (intents.includes("storefront") && !channels.includes("pos")) {
    return "/dashboard/storefront";
  }
  if (channels.includes("delivery_apps") && !channels.includes("pos")) {
    return "/dashboard/sales-channels";
  }
  if (channels.includes("pos") || channels.includes("all")) {
    return "/dashboard/pos/terminal?welcome=true";
  }
  if (operatingModel === "CATERING_QUOTES_EVENTS") {
    return "/dashboard/catering-quotes";
  }
  return "/dashboard/today";
}
