/**
 * Product mapping policy — complements `matching-engine` and `matching-confidence`.
 */

import type { ProductMappingConfidence } from "@prisma/client";

export { BULK_APPROVABLE, isBulkApprovable } from "@/lib/product-mapping/matching-confidence";

export const NEVER_AUTO_MAP: ProductMappingConfidence[] = ["LOW", "MEDIUM", "NONE"];

export function canAutoSuggestMapping(confidence: ProductMappingConfidence): boolean {
  return confidence === "EXACT_SKU" || confidence === "EXACT_TITLE" || confidence === "HIGH";
}

export function requiresHumanReview(confidence: ProductMappingConfidence): boolean {
  return NEVER_AUTO_MAP.includes(confidence);
}
