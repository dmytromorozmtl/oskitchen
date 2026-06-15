import { createHash } from "node:crypto";

/** Canonical cart line identity for server + client (product + variant + sorted modifiers). */
export type CartLineIdentity = {
  productId: string;
  variantId?: string | null;
  modifierOptionIds?: string[];
};

export function normalizeModifierIds(ids: string[] | undefined | null): string[] {
  if (!ids?.length) return [];
  return [...new Set(ids)].sort();
}

export function cartLineKey(line: CartLineIdentity): string {
  const mods = normalizeModifierIds(line.modifierOptionIds).join(",");
  const variant = line.variantId ?? "";
  return `${line.productId}:${variant}:${mods}`;
}

export function parseCartLineKey(key: string): CartLineIdentity | null {
  const parts = key.split(":");
  if (parts.length < 2) return null;
  const productId = parts[0];
  if (!/^[0-9a-f-]{36}$/i.test(productId)) return null;
  const variantId = parts[1] || undefined;
  const modifierOptionIds = parts[2] ? parts[2].split(",").filter(Boolean) : [];
  return {
    productId,
    variantId: variantId && /^[0-9a-f-]{36}$/i.test(variantId) ? variantId : undefined,
    modifierOptionIds,
  };
}

export function hashCartLines(lines: CartLineIdentity[]): string {
  const payload = lines
    .map((l) => `${cartLineKey(l)}`)
    .sort()
    .join("|");
  return createHash("sha256").update(payload).digest("hex").slice(0, 16);
}
