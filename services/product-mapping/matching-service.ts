import { prisma } from "@/lib/prisma";
import {
  productListWhereForOwner,
  productListWhereForOwnerAnd,
} from "@/lib/scope/workspace-resource-scope";
import {
  productMappingAliasListWhereForOwner,
  productMappingListWhereForOwner,
} from "@/lib/scope/workspace-product-mapping-scope";
import {
  matchExternalToInternal,
  normalizeTitle,
  type CandidateProduct,
  type MatchInput,
  type MatchOutcome,
} from "@/lib/product-mapping/matching-engine";
import { normalizeProviderKey } from "@/lib/product-mapping/provider-types";
import type { ProductMappingProvider } from "@prisma/client";

export type RunMatchInput = {
  userId: string;
  provider: ProductMappingProvider | null;
  externalTitle: string;
  externalSku?: string | null;
  externalCategory?: string | null;
  externalProductId?: string | null;
  brandId?: string | null;
};

export async function loadCandidates(userId: string, brandId?: string | null): Promise<CandidateProduct[]> {
  const where = brandId
    ? await productListWhereForOwnerAnd(userId, { brandId })
    : await productListWhereForOwner(userId);
  const products = await prisma.product.findMany({
    where,
    select: { id: true, title: true, brandId: true, category: true },
    take: 500,
    orderBy: { title: "asc" },
  });
  return products.map((p) => ({
    id: p.id,
    title: p.title,
    sku: null,
    brandId: p.brandId,
    category: p.category,
  }));
}

export async function loadAliasIndex(userId: string, provider?: ProductMappingProvider | null): Promise<Map<string, string>> {
  const scope = await productMappingAliasListWhereForOwner(userId);
  const aliases = await prisma.productMappingAlias.findMany({
    where: {
      AND: [
        scope,
        { active: true },
        ...(provider ? [{ OR: [{ provider }, { provider: null }] }] : []),
      ],
    },
    select: { normalizedTitle: true, internalProductId: true },
  });
  const map = new Map<string, string>();
  for (const a of aliases) {
    map.set(a.normalizedTitle, a.internalProductId);
  }
  return map;
}

export async function loadApprovedExternalIndex(
  userId: string,
  provider?: ProductMappingProvider | null,
): Promise<Map<string, string>> {
  const scope = await productMappingListWhereForOwner(userId);
  const rows = await prisma.productMapping.findMany({
    where: {
      AND: [
        scope,
        { status: { in: ["APPROVED", "CONFIRMED"] }, internalProductId: { not: null } },
        ...(provider ? [{ providerKey: provider }] : []),
      ],
    },
    select: { externalProductId: true, internalProductId: true },
  });
  const map = new Map<string, string>();
  for (const r of rows) {
    if (r.internalProductId) map.set(r.externalProductId, r.internalProductId);
  }
  return map;
}

export async function runMatch(input: RunMatchInput): Promise<MatchOutcome> {
  const [candidates, aliasIndex, approvedExternalIndex] = await Promise.all([
    loadCandidates(input.userId, input.brandId ?? null),
    loadAliasIndex(input.userId, input.provider),
    loadApprovedExternalIndex(input.userId, input.provider),
  ]);

  const matchInput: MatchInput = {
    externalTitle: input.externalTitle,
    externalSku: input.externalSku ?? null,
    externalCategory: input.externalCategory ?? null,
    externalProductId: input.externalProductId ?? null,
    provider: input.provider ?? null,
    aliasIndex,
    approvedExternalIndex,
  };

  return matchExternalToInternal(matchInput, candidates);
}

export function externalTitleNorm(value: string): string {
  return normalizeTitle(value);
}

export { normalizeProviderKey };
