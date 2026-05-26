import { logger } from "@/lib/logger";
import {
  allStorefrontTags as allStorefrontCacheTags,
  allStorefrontCatalogTags,
  storefrontCatalogTag,
  storefrontSettingsTag,
  storefrontThemeTag,
} from "@/lib/storefront/cache-tags";
import { loadMarketsForStorefrontOwner } from "@/lib/storefront/market-resolve";
import {
  storefrontSlugCacheTag,
  storefrontSitemapCacheTag,
  storefrontThemeArmCacheTag,
  themeSnapshotCacheTag,
} from "@/lib/storefront/cdn-cache";
import type { ThemeExperimentArm } from "@/lib/storefront/theme-experiment";
import { evaluateExperimentCdnPurgeGate } from "@/lib/storefront/theme-experiment-cdn-gate";
import { logThemeExperimentObservability } from "@/lib/storefront/theme-experiment-observability";

export type CdnPurgeInput = {
  storefrontId: string;
  storeSlug: string;
  themePublishedAt?: Date | null;
  /** When set, applies version gate before arm-specific experiment tags (5C). */
  themeExperimentJson?: unknown;
};

/** Best-effort CDN purge after theme publish (Vercel / Cloudflare). */
export async function purgeStorefrontCdnAfterThemePublish(input: CdnPurgeInput): Promise<void> {
  const tags = [
    storefrontSlugCacheTag(input.storeSlug),
    storefrontSitemapCacheTag(input.storefrontId),
    themeSnapshotCacheTag(input.storefrontId, input.themePublishedAt ?? null),
  ];

  if (input.themeExperimentJson !== undefined) {
    const gate = await evaluateExperimentCdnPurgeGate({
      storeSlug: input.storeSlug,
      themeExperimentJson: input.themeExperimentJson,
    });
    tags.push(...gate.armTags);
    logThemeExperimentObservability("cdn_purge", {
      storeSlug: input.storeSlug,
      edge_sync_version: gate.edgeVersion,
      db_version: gate.dbVersion,
      skip_arm_tags: gate.skipArmTags,
      versions_match: gate.versionsMatch,
    });
  }

  await Promise.all([purgeVercelCacheByTags(tags), purgeCloudflareCacheByTags(tags)]);
}

const THEME_ARMS: ThemeExperimentArm[] = ["published", "draft"];

/** After experiment conclude — purge only per-arm HTML tags, not full storefront/sitemap. */
export async function purgeStorefrontThemeExperimentArmTags(storeSlug: string): Promise<void> {
  const tags = THEME_ARMS.map((arm) => storefrontThemeArmCacheTag(storeSlug, arm));
  logThemeExperimentObservability("cdn_purge_experiment_arms_only", {
    storeSlug,
    tags: tags.join(","),
  });
  await Promise.all([purgeVercelCacheByTags(tags), purgeCloudflareCacheByTags(tags)]);
}

export type StorefrontCdnPurgeScope = "catalog" | "theme" | "settings" | "all";

/** Purge edge CDN tags aligned with Next revalidateTag + legacy slug tag. */
export async function purgeStorefrontCdnByScope(input: {
  storefrontId: string;
  storeSlug: string;
  scope: StorefrontCdnPurgeScope;
  ownerUserId?: string;
}): Promise<void> {
  const tags: string[] = [storefrontSlugCacheTag(input.storeSlug)];
  if (input.scope === "all" || input.scope === "catalog") {
    if (input.ownerUserId) {
      const markets = await loadMarketsForStorefrontOwner(input.ownerUserId);
      tags.push(...allStorefrontCatalogTags(input.storeSlug, markets.map((m) => m.id)));
    } else {
      tags.push(storefrontCatalogTag(input.storeSlug));
    }
  }
  if (input.scope === "all" || input.scope === "theme") tags.push(storefrontThemeTag(input.storeSlug));
  if (input.scope === "all" || input.scope === "settings") tags.push(storefrontSettingsTag(input.storeSlug));
  if (input.scope === "all") {
    tags.push(storefrontSitemapCacheTag(input.storefrontId));
    for (const t of allStorefrontCacheTags(input.storeSlug)) tags.push(t);
  }
  const unique = [...new Set(tags)];
  await Promise.all([purgeVercelCacheByTags(unique), purgeCloudflareCacheByTags(unique)]);
}

export async function purgeVercelCacheByTags(tags: string[]): Promise<void> {
  const teamId = process.env.VERCEL_TEAM_ID?.trim();
  const projectId = process.env.VERCEL_PROJECT_ID?.trim();
  const token = process.env.VERCEL_API_TOKEN?.trim();
  if (!teamId || !projectId || !token) return;

  try {
    const res = await fetch(
      `https://api.vercel.com/v1/edge-config/tokens?teamId=${encodeURIComponent(teamId)}`,
      { method: "GET", headers: { Authorization: `Bearer ${token}` } },
    );
    if (!res.ok) {
      // Fallback: invalidate deployment cache via purge API when available
      const purgeRes = await fetch(`https://api.vercel.com/v1/edge-cache/invalidate-by-tags`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tags, projectId, teamId }),
      });
      if (!purgeRes.ok) {
        logger.warn("Vercel CDN tag purge failed", { status: purgeRes.status, tags });
      }
    }
  } catch (e) {
    logger.warn("Vercel CDN purge error", { error: String(e) });
  }
}

export async function purgeCloudflareCacheByTags(tags: string[]): Promise<void> {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID?.trim();
  const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();
  if (!zoneId || !apiToken) return;

  try {
    const res = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tags }),
    });
    if (!res.ok) {
      logger.warn("Cloudflare CDN tag purge failed", { status: res.status, tags });
    }
  } catch (e) {
    logger.warn("Cloudflare CDN purge error", { error: String(e) });
  }
}
