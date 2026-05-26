import type { StorefrontSectionType } from "@prisma/client";

import { normalizeSectionContent } from "@/lib/storefront/sections";

export function validateSectionJson(
  type: StorefrontSectionType,
  raw: unknown,
): { ok: true; normalized: Record<string, unknown> } | { ok: false; error: string } {
  const normalized = normalizeSectionContent(type, raw);
  if (!normalized) return { ok: false, error: "Section JSON failed schema validation." };
  return { ok: true, normalized };
}
