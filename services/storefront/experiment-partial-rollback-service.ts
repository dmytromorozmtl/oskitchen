import { createHash } from "node:crypto";
import { toJsonValue } from "@/lib/prisma/json";

import { prisma } from "@/lib/prisma";
import { buildThemeSnapshotV1 } from "@/lib/storefront/theme-snapshot";
import {
  buildFullRevertSnapshot,
  buildPartialRevertSnapshot,
  isPartialRollbackEnabled,
  readPartialRollbackSnapshot,
  seedPartialRollbackSnapshot,
} from "@/lib/storefront/theme-experiment-partial-rollback";
import { purgeStorefrontCdnAfterThemePublish } from "@/lib/storefront/cdn-purge";
import { themeSnapshotCacheTag } from "@/lib/storefront/cdn-cache";

function extractNavItemsForSnapshot(raw: unknown): unknown {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && "items" in raw) {
    return (raw as { items: unknown }).items;
  }
  return [];
}

function extractFooterBlocksForSnapshot(raw: unknown): unknown {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object" && "blocks" in raw) {
    return (raw as { blocks: unknown }).blocks;
  }
  return [];
}

export function hashPartialRollbackToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function seedPartialRollbackForPublish(input: {
  storefrontId: string;
  themeExperimentJson: unknown;
}): Promise<void> {
  if (!isPartialRollbackEnabled()) return;

  const sf = await prisma.storefrontSettings.findUnique({
    where: { id: input.storefrontId },
    include: { navigation: true, footer: true },
  });
  if (!sf?.themePublishedJson) return;

  const winner = buildThemeSnapshotV1({
    navigationItems: extractNavItemsForSnapshot(sf.navigation?.itemsJson),
    footerBlocks: extractFooterBlocksForSnapshot(sf.footer?.blocksJson),
    tokens: {
      brandColor: sf.brandColor,
      secondaryColor: sf.secondaryColor,
      backgroundColor: sf.backgroundColor,
      textColor: sf.textColor,
    },
  });

  const published = sf.themePublishedJson as ReturnType<typeof buildThemeSnapshotV1>;
  const merged = seedPartialRollbackSnapshot({
    previousRaw: input.themeExperimentJson,
    publishedSnapshot: published,
    winnerSnapshot: winner,
    counterfactualLiftPp: 0,
  });

  const token = createHash("sha256")
    .update(`partial:${input.storefrontId}:${Date.now()}`)
    .digest("hex")
    .slice(0, 32);
  merged.partialRollbackTokenHash = hashPartialRollbackToken(token);

  await prisma.storefrontSettings.update({
    where: { id: input.storefrontId },
    data: { themeExperimentJson: merged as object },
  });
}

export async function applyPartialThemeRollback(storefrontId: string): Promise<{ ok: boolean; error?: string }> {
  const sf = await prisma.storefrontSettings.findUnique({
    where: { id: storefrontId },
    select: {
      id: true,
      storeSlug: true,
      themeExperimentJson: true,
      themePublishedAt: true,
    },
  });
  if (!sf) return { ok: false, error: "not_found" };

  const snap = readPartialRollbackSnapshot(sf.themeExperimentJson);
  if (!snap) return { ok: false, error: "no_partial_snapshot" };

  const reverted = buildPartialRevertSnapshot(snap);
  const publishedAt = new Date();
  const withTag = {
    ...(reverted as object),
    _cacheTag: themeSnapshotCacheTag(sf.id, publishedAt),
  };

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: {
      themePublishedJson: withTag as object,
      themePublishedAt: publishedAt,
      themeDraftJson: withTag as object,
    },
  });

  void purgeStorefrontCdnAfterThemePublish({
    storefrontId: sf.id,
    storeSlug: sf.storeSlug,
    themePublishedAt: publishedAt,
    themeExperimentJson: sf.themeExperimentJson,
  });

  return { ok: true };
}

export async function applyFullThemeRollback(storefrontId: string): Promise<{ ok: boolean; error?: string }> {
  const sf = await prisma.storefrontSettings.findUnique({
    where: { id: storefrontId },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
  });
  if (!sf) return { ok: false, error: "not_found" };

  const snap = readPartialRollbackSnapshot(sf.themeExperimentJson);
  if (!snap) return { ok: false, error: "no_partial_snapshot" };

  const reverted = buildFullRevertSnapshot(snap);
  const publishedAt = new Date();
  const withTag = {
    ...(reverted as object),
    _cacheTag: themeSnapshotCacheTag(sf.id, publishedAt),
  };

  await prisma.storefrontSettings.update({
    where: { id: sf.id },
    data: {
      themePublishedJson: withTag as object,
      themePublishedAt: publishedAt,
      themeDraftJson: withTag as object,
    },
  });

  void purgeStorefrontCdnAfterThemePublish({
    storefrontId: sf.id,
    storeSlug: sf.storeSlug,
    themePublishedAt: publishedAt,
    themeExperimentJson: sf.themeExperimentJson,
  });

  return { ok: true };
}
