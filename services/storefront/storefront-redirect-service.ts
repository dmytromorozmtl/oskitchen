import type { StorefrontRedirect } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  isSensitiveStorefrontRedirectPath,
  normalizeStorefrontRelativePath,
  storefrontRedirectAllowsSensitivePaths,
  storefrontRedirectMaxChainDepth,
  validateRedirectFromToPaths,
  wouldRedirectLoop,
} from "@/lib/storefront/storefront-redirects";

export type ResolvedStorefrontRedirect = {
  redirectId: string;
  locationPath: string;
  httpStatus: 301 | 302;
};

function buildInternalTarget(storeSlug: string, toPath: string): string {
  const raw = toPath.trim();
  if (raw.startsWith("/s/")) return normalizeStorefrontRelativePath(raw.replace(/\/+$/, "") || "/");
  const rel = normalizeStorefrontRelativePath(raw);
  return `/s/${storeSlug}${rel === "/" ? "" : rel}`;
}

function suffixFromInternalLocation(locationPath: string, storeSlug: string): string | null {
  const prefix = `/s/${storeSlug}`;
  if (!locationPath.startsWith(prefix)) return null;
  const tail = locationPath.slice(prefix.length) || "/";
  return normalizeStorefrontRelativePath(tail);
}

function finalizeRedirectTarget(
  row: Pick<StorefrontRedirect, "toPath" | "httpStatus" | "fromPath">,
  storeSlug: string,
): { ok: true; locationPath: string; httpStatus: 301 | 302 } | { ok: false } {
  const v = validateRedirectFromToPaths(row.fromPath, row.toPath);
  if (!v.ok) return { ok: false };
  const locationPath = buildInternalTarget(storeSlug, row.toPath);
  const suffix = normalizeStorefrontRelativePath(row.fromPath);
  const destSuffix = locationPath.replace(/^\/s\/[^/]+/, "") || "/";
  if (wouldRedirectLoop(suffix, destSuffix)) return { ok: false };
  const st = row.httpStatus === 301 ? 301 : 302;
  return { ok: true, locationPath, httpStatus: st };
}

/**
 * Find active redirect for a storefront slug + path suffix (e.g. suffix "/old" for /s/foo/old).
 * Increments hitCount on the first matched rule when incrementHits is true (middleware path).
 *
 * When `STOREFRONT_REDIRECT_FOLLOW_CHAIN=true`, follows up to `STOREFRONT_REDIRECT_CHAIN_MAX` (1–3)
 * internal hops; otherwise a single match is returned. Sensitive paths are blocked unless
 * `STOREFRONT_REDIRECT_ALLOW_SENSITIVE_PATHS=true`.
 */
export async function resolveStorefrontRedirectForPath(input: {
  storeSlug: string;
  pathSuffix: string;
  incrementHits: boolean;
}): Promise<ResolvedStorefrontRedirect | null> {
  const suffix = normalizeStorefrontRelativePath(input.pathSuffix);
  const sf = await prisma.storefrontSettings.findUnique({
    where: { storeSlug: input.storeSlug },
    select: { id: true, enabled: true, published: true },
  });
  if (!sf?.enabled || !sf.published) return null;

  const allowSensitive = storefrontRedirectAllowsSensitivePaths();
  const maxDepth = storefrontRedirectMaxChainDepth();

  let currentSuffix = suffix;
  const visited = new Set<string>();
  let firstMatchedRowId: string | null = null;
  let lastResolved: ResolvedStorefrontRedirect | null = null;

  for (let depth = 0; depth < maxDepth; depth++) {
    if (visited.has(currentSuffix)) return null;
    visited.add(currentSuffix);

    if (!allowSensitive && isSensitiveStorefrontRedirectPath(currentSuffix)) {
      return null;
    }

    const row = await prisma.storefrontRedirect.findFirst({
      where: { storefrontId: sf.id, active: true, fromPath: currentSuffix },
    });
    if (!row) {
      if (depth === 0) return null;
      break;
    }

    if (depth === 0) firstMatchedRowId = row.id;

    const built = finalizeRedirectTarget(row, input.storeSlug);
    if (!built.ok) return null;

    const destSuffix = suffixFromInternalLocation(built.locationPath, input.storeSlug);
    if (destSuffix === null) return null;

    if (!allowSensitive && isSensitiveStorefrontRedirectPath(destSuffix)) {
      return null;
    }

    lastResolved = { redirectId: row.id, locationPath: built.locationPath, httpStatus: built.httpStatus };

    if (depth + 1 >= maxDepth) break;

    const next = await prisma.storefrontRedirect.findFirst({
      where: { storefrontId: sf.id, active: true, fromPath: destSuffix },
      select: { id: true },
    });
    if (!next) break;
    currentSuffix = destSuffix;
  }

  if (!lastResolved) return null;

  if (input.incrementHits && firstMatchedRowId) {
    await prisma.storefrontRedirect.update({
      where: { id: firstMatchedRowId },
      data: { hitCount: { increment: 1 } },
    });
  }

  return lastResolved;
}

export async function upsertStorefrontRedirectForStorefront(input: {
  storefrontId: string;
  id?: string | null;
  fromPath: string;
  toPath: string;
  httpStatus: number;
  active: boolean;
}) {
  const v = validateRedirectFromToPaths(input.fromPath, input.toPath);
  if (!v.ok) throw new Error(v.reason);
  const fromPath = normalizeStorefrontRelativePath(input.fromPath);
  const toPath = input.toPath.trim();
  const httpStatus = input.httpStatus === 301 ? 301 : 302;
  if (input.id) {
    await prisma.storefrontRedirect.update({
      where: { id: input.id },
      data: { fromPath, toPath, httpStatus, active: input.active },
    });
  } else {
    await prisma.storefrontRedirect.create({
      data: { storefrontId: input.storefrontId, fromPath, toPath, httpStatus, active: input.active },
    });
  }
}

export async function deleteStorefrontRedirectForStorefront(storefrontId: string, id: string) {
  await prisma.storefrontRedirect.deleteMany({ where: { id, storefrontId } });
}
