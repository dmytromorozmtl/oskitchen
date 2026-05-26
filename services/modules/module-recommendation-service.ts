import type { BusinessType } from "@prisma/client";

import { getBusinessModeModulePlan } from "@/lib/business-mode/business-mode-config";
import { MODULE_REGISTRY_ENTRIES } from "@/lib/modules/module-registry";

function hrefForModuleKey(key: (typeof MODULE_REGISTRY_ENTRIES)[number]["key"]): string {
  const e = MODULE_REGISTRY_ENTRIES.find((x) => x.key === key);
  return e?.pathPrefixes[0] ?? "/dashboard/today";
}

/** Product / onboarding helper — which modules to highlight next. */
export function recommendNextModules(businessType: BusinessType | null | undefined): {
  headline: string;
  hrefs: readonly string[];
} {
  const plan = getBusinessModeModulePlan(businessType);
  const hrefs = plan.recommended.slice(0, 6).map((key) => hrefForModuleKey(key));
  return {
    headline: "Recommended next steps for your operating mode",
    hrefs,
  };
}
