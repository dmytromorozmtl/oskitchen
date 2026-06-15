import type { ProductMappingConfidence, ProductMappingProvider } from "@prisma/client";

import { classifyScore } from "@/lib/product-mapping/matching-confidence";

export type CandidateProduct = {
  id: string;
  title: string;
  sku?: string | null;
  category?: string | null;
  brandId?: string | null;
};

export type MatchReasonCode =
  | "EXACT_SKU"
  | "EXACT_EXTERNAL_ID"
  | "EXACT_TITLE"
  | "ALIAS"
  | "TITLE_SIMILARITY"
  | "CATEGORY_TITLE_SIMILARITY"
  | "NO_MATCH";

export type MatchReason = {
  code: MatchReasonCode;
  detail?: string;
  candidateId?: string;
  score: number;
};

export type MatchInput = {
  externalTitle: string;
  externalSku?: string | null;
  externalCategory?: string | null;
  externalProductId?: string | null;
  provider?: ProductMappingProvider | null;
  /**
   * Map of `normalizedTitle → internalProductId` from
   * `ProductMappingAlias` rows scoped to this workspace.
   */
  aliasIndex?: Map<string, string>;
  /**
   * Map of `externalProductId → internalProductId` from existing
   * APPROVED `ProductMapping` rows.
   */
  approvedExternalIndex?: Map<string, string>;
};

export type MatchOutcome = {
  candidateId: string | null;
  candidate: CandidateProduct | null;
  score: number;
  label: ProductMappingConfidence;
  reasons: MatchReason[];
};

const PROVIDER_TITLE_SUFFIXES = [
  /\s*\(shopify\)$/i,
  /\s*\(woocommerce\)$/i,
  /\s*\(uber\s*eats\)$/i,
  /\s*\(uber\s*direct\)$/i,
  /\s*\(catering\)$/i,
];

export function normalizeTitle(value: string): string {
  if (!value) return "";
  let v = value.normalize("NFKD").replace(/[\u0300-\u036f]/g, ""); // strip accents
  for (const re of PROVIDER_TITLE_SUFFIXES) v = v.replace(re, "");
  return v
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeSku(value: string | null | undefined): string {
  if (!value) return "";
  return value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
}

function tokenJaccard(a: string, b: string): number {
  const aTokens = new Set(a.split(" ").filter(Boolean));
  const bTokens = new Set(b.split(" ").filter(Boolean));
  if (aTokens.size === 0 || bTokens.size === 0) return 0;
  const intersection = [...aTokens].filter((t) => bTokens.has(t)).length;
  const union = new Set([...aTokens, ...bTokens]).size;
  return intersection / union;
}

function tokenContainment(a: string, b: string): number {
  const aTokens = new Set(a.split(" ").filter(Boolean));
  const bTokens = new Set(b.split(" ").filter(Boolean));
  if (aTokens.size === 0 || bTokens.size === 0) return 0;
  const intersection = [...aTokens].filter((t) => bTokens.has(t)).length;
  const denom = Math.min(aTokens.size, bTokens.size);
  return intersection / denom;
}

function scoreTitle(external: string, internal: string): number {
  if (!external || !internal) return 0;
  if (external === internal) return 1;
  if (internal.includes(external) || external.includes(internal)) return 0.9;
  const jaccard = tokenJaccard(external, internal);
  const contain = tokenContainment(external, internal);
  return Math.max(jaccard, contain * 0.9);
}

function scoreCategoryTitle(
  externalTitle: string,
  internalTitle: string,
  externalCategory: string | null | undefined,
): number {
  if (!externalCategory) return 0;
  const externalCat = normalizeTitle(externalCategory);
  if (!externalCat) return 0;
  const titleScore = scoreTitle(externalTitle, internalTitle);
  if (titleScore < 0.25) return 0;
  return Math.min(0.7, titleScore + 0.15);
}

/**
 * Deterministic matching ladder:
 *   1. exact SKU (highest confidence)
 *   2. exact external ID previously approved
 *   3. exact normalized title
 *   4. alias match
 *   5. token similarity on title
 *   6. category + title similarity
 *   7. NONE
 */
export function matchExternalToInternal(
  input: MatchInput,
  candidates: CandidateProduct[],
): MatchOutcome {
  const externalTitleNorm = normalizeTitle(input.externalTitle);
  const externalSkuNorm = normalizeSku(input.externalSku);
  const reasons: MatchReason[] = [];

  if (externalSkuNorm) {
    const skuHit = candidates.find((c) => normalizeSku(c.sku) === externalSkuNorm);
    if (skuHit) {
      reasons.push({ code: "EXACT_SKU", candidateId: skuHit.id, score: 1, detail: externalSkuNorm });
      return { candidateId: skuHit.id, candidate: skuHit, score: 1, label: "EXACT_SKU", reasons };
    }
  }

  if (input.externalProductId && input.approvedExternalIndex) {
    const approvedId = input.approvedExternalIndex.get(input.externalProductId);
    if (approvedId) {
      const hit = candidates.find((c) => c.id === approvedId) ?? null;
      reasons.push({ code: "EXACT_EXTERNAL_ID", candidateId: approvedId, score: 1 });
      return { candidateId: approvedId, candidate: hit, score: 1, label: "EXACT_SKU", reasons };
    }
  }

  if (externalTitleNorm) {
    const titleHit = candidates.find((c) => normalizeTitle(c.title) === externalTitleNorm);
    if (titleHit) {
      reasons.push({ code: "EXACT_TITLE", candidateId: titleHit.id, score: 0.95 });
      return { candidateId: titleHit.id, candidate: titleHit, score: 0.95, label: "EXACT_TITLE", reasons };
    }
  }

  if (input.aliasIndex) {
    const aliasHit = input.aliasIndex.get(externalTitleNorm);
    if (aliasHit) {
      const hit = candidates.find((c) => c.id === aliasHit) ?? null;
      reasons.push({ code: "ALIAS", candidateId: aliasHit, score: 0.92 });
      return { candidateId: aliasHit, candidate: hit, score: 0.92, label: "HIGH", reasons };
    }
  }

  let bestScore = 0;
  let best: CandidateProduct | null = null;
  for (const c of candidates) {
    const titleScore = scoreTitle(externalTitleNorm, normalizeTitle(c.title));
    if (titleScore > bestScore) {
      bestScore = titleScore;
      best = c;
    }
  }
  if (best && bestScore >= 0.55) {
    reasons.push({ code: "TITLE_SIMILARITY", candidateId: best.id, score: bestScore });
    return {
      candidateId: best.id,
      candidate: best,
      score: bestScore,
      label: classifyScore(bestScore),
      reasons,
    };
  }

  let categoryBestScore = 0;
  let categoryBest: CandidateProduct | null = null;
  for (const c of candidates) {
    const catScore = scoreCategoryTitle(externalTitleNorm, normalizeTitle(c.title), input.externalCategory);
    if (catScore > categoryBestScore) {
      categoryBestScore = catScore;
      categoryBest = c;
    }
  }
  if (categoryBest && categoryBestScore >= 0.45) {
    reasons.push({ code: "CATEGORY_TITLE_SIMILARITY", candidateId: categoryBest.id, score: categoryBestScore });
    return {
      candidateId: categoryBest.id,
      candidate: categoryBest,
      score: categoryBestScore,
      label: classifyScore(categoryBestScore),
      reasons,
    };
  }

  if (best && bestScore > 0) {
    reasons.push({ code: "TITLE_SIMILARITY", candidateId: best.id, score: bestScore });
    return {
      candidateId: null,
      candidate: best,
      score: bestScore,
      label: classifyScore(bestScore),
      reasons,
    };
  }

  reasons.push({ code: "NO_MATCH", score: 0 });
  return { candidateId: null, candidate: null, score: 0, label: "NONE", reasons };
}

/**
 * Only attach the internal product id when confidence is at or above
 * HIGH. Below that we keep the candidate visible in match reasons but
 * leave `internalProductId` null so an operator must explicitly pick.
 */
export function shouldAttachCandidate(label: ProductMappingConfidence): boolean {
  return label === "EXACT_SKU" || label === "EXACT_TITLE" || label === "HIGH" || label === "MANUAL";
}
