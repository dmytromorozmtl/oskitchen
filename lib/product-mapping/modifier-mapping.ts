import type { ProductMappingProvider } from "@prisma/client";

/** Canonical OS Kitchen modifier keys used by storefront / production. */
export const CANONICAL_MODIFIER_KEYS = [
  "size",
  "protein",
  "side",
  "spice",
  "addon",
  "substitution",
  "drink",
  "preparation",
  "packaging",
  "delivery_instruction",
] as const;

export type CanonicalModifierKey = (typeof CANONICAL_MODIFIER_KEYS)[number];

const ALIASES: Record<string, CanonicalModifierKey> = {
  size: "size",
  sizes: "size",
  portion: "size",
  bowl: "size",
  protein: "protein",
  meat: "protein",
  side: "side",
  sides: "side",
  spice: "spice",
  "spice level": "spice",
  heat: "spice",
  addon: "addon",
  "add on": "addon",
  "add-on": "addon",
  extras: "addon",
  substitution: "substitution",
  substitute: "substitution",
  swap: "substitution",
  drink: "drink",
  drinks: "drink",
  beverage: "drink",
  prep: "preparation",
  "preparation": "preparation",
  cooking: "preparation",
  packaging: "packaging",
  pack: "packaging",
  delivery: "delivery_instruction",
  notes: "delivery_instruction",
};

export function suggestModifierKey(name: string): CanonicalModifierKey | null {
  const normalised = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
  if (!normalised) return null;
  if ((CANONICAL_MODIFIER_KEYS as readonly string[]).includes(normalised)) {
    return normalised as CanonicalModifierKey;
  }
  if (ALIASES[normalised]) return ALIASES[normalised];
  for (const [alias, key] of Object.entries(ALIASES)) {
    if (normalised.includes(alias)) return key;
  }
  return null;
}

export type ModifierDraft = {
  provider: ProductMappingProvider;
  externalModifierId?: string | null;
  externalModifierName: string;
  externalOptionName?: string | null;
  suggestedKey: CanonicalModifierKey | null;
  suggestedOptionValue: string | null;
};

export function buildModifierDraft(
  provider: ProductMappingProvider,
  externalModifierName: string,
  externalOptionName?: string | null,
  externalModifierId?: string | null,
): ModifierDraft {
  return {
    provider,
    externalModifierId: externalModifierId ?? null,
    externalModifierName,
    externalOptionName: externalOptionName ?? null,
    suggestedKey: suggestModifierKey(externalModifierName),
    suggestedOptionValue: externalOptionName ? externalOptionName.trim() : null,
  };
}
