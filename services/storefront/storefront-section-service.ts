import type { StorefrontSectionType } from "@prisma/client";

import { validateSectionPayload } from "@/lib/storefront/section-validation";

export function validateStorefrontSectionOrThrow(type: StorefrontSectionType, raw: unknown) {
  const normalized = validateSectionPayload(type, raw);
  if (!normalized) {
    throw new Error("Invalid section payload for type " + type);
  }
  return normalized;
}
