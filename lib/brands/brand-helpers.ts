import type { BrandConceptKind, BrandLifecycleStatus } from "@prisma/client";

import { BRAND_CONCEPT_LABELS, BRAND_LIFECYCLE_LABELS } from "@/lib/brands/brand-types";

export function slugifyBrandSlug(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function isBrandOperational(status: BrandLifecycleStatus): boolean {
  return status === "ACTIVE";
}

export function formatConceptKind(kind: BrandConceptKind): string {
  return BRAND_CONCEPT_LABELS[kind] ?? kind;
}

export function formatLifecycle(status: BrandLifecycleStatus): string {
  return BRAND_LIFECYCLE_LABELS[status] ?? status;
}

/** Rough setup completeness for hub cards (0–1). */
export function brandSetupProgress(input: {
  hasLogo: boolean;
  hasColor: boolean;
  menuCount: number;
  storefrontCount: number;
  hasDescription: boolean;
}): number {
  let score = 0;
  const steps = 5;
  if (input.hasDescription) score += 1;
  if (input.hasLogo) score += 1;
  if (input.hasColor) score += 1;
  if (input.menuCount > 0) score += 1;
  if (input.storefrontCount > 0) score += 1;
  return Math.round((score / steps) * 100) / 100;
}
