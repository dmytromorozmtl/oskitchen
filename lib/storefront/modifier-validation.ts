import type { StorefrontCatalogModifierGroup } from "@/lib/storefront/catalog-types";

export type ModifierValidationResult = {
  ok: boolean;
  missingRequired: { groupId: string; name: string }[];
  message?: string;
};

/** Shared PDP + server cart rules for required modifier groups. */
export function validateRequiredModifiers(
  groups: StorefrontCatalogModifierGroup[],
  selectedOptionIds: string[],
): ModifierValidationResult {
  const selected = new Set(selectedOptionIds);
  const missingRequired: { groupId: string; name: string }[] = [];

  for (const g of groups) {
    const groupOptionIds = new Set(g.options.map((o) => o.id));
    const count = [...selected].filter((id) => groupOptionIds.has(id)).length;
    const min = g.required ? Math.max(1, g.minSelections) : g.minSelections;
    if (count < min) {
      missingRequired.push({ groupId: g.id, name: g.name });
    }
    if (count > g.maxSelections) {
      return {
        ok: false,
        missingRequired,
        message: `Too many options selected for “${g.name}”.`,
      };
    }
  }

  if (missingRequired.length > 0) {
    const names = missingRequired.map((m) => m.name).join(", ");
    return {
      ok: false,
      missingRequired,
      message: `Please choose: ${names}`,
    };
  }

  return { ok: true, missingRequired: [] };
}
