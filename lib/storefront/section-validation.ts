import type { StorefrontSectionType } from "@prisma/client";

import { normalizeSectionContent } from "@/lib/storefront/sections";

export function validateSectionPayload(type: StorefrontSectionType, raw: unknown) {
  return normalizeSectionContent(type, raw);
}
