import type { BusinessType } from "@prisma/client";

import { getBusinessModeExperience } from "@/lib/business-mode-registry";
import type { ModuleKey } from "@/lib/module-visibility";

export function candidateModuleKeysForBusinessType(
  businessType: BusinessType | null | undefined,
): { key: ModuleKey; label: string; recommended: boolean }[] {
  const exp = getBusinessModeExperience(businessType);
  const locked = new Set<ModuleKey>(["dashboard", "today", "settings", "billing", "support"]);
  const out: { key: ModuleKey; label: string; recommended: boolean }[] = [];
  const seen = new Set<string>();
  const push = (key: ModuleKey, recommended: boolean) => {
    if (locked.has(key) || seen.has(key)) return;
    seen.add(key);
    out.push({ key, label: key.replace(/_/g, " "), recommended });
  };
  for (const k of exp.defaultModuleKeys) {
    if (!locked.has(k)) push(k, true);
  }
  for (const k of exp.recommendedModuleKeys) push(k, true);
  for (const k of exp.advancedModuleKeys) push(k, false);
  return out.slice(0, 24);
}
