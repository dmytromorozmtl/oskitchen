import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "kos_sf_preview";

function secret(): string | null {
  const s = process.env.STOREFRONT_PREVIEW_SECRET?.trim() || process.env.AUTH_SECRET?.trim();
  return s && s.length >= 16 ? s : null;
}

export function createStorefrontPreviewToken(ownerUserId: string, storeSlug: string, ttlSec = 900): string | null {
  const sec = secret();
  if (!sec) return null;
  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  const payload = `${ownerUserId}|${storeSlug}|${exp}`;
  const sig = createHmac("sha256", sec).update(payload).digest("hex");
  return Buffer.from(`${payload}|${sig}`, "utf8").toString("base64url");
}

export function verifyStorefrontPreviewToken(token: string, storeSlug: string): { ownerUserId: string } | null {
  const sec = secret();
  if (!sec) return null;
  let raw: string;
  try {
    raw = Buffer.from(token, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const parts = raw.split("|");
  if (parts.length !== 4) return null;
  const [ownerUserId, slug, expStr, sig] = parts;
  if (slug !== storeSlug) return null;
  const exp = parseInt(expStr, 10);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return null;
  const payload = `${ownerUserId}|${slug}|${expStr}`;
  const expected = createHmac("sha256", sec).update(payload).digest("hex");
  try {
    if (expected.length !== sig.length || !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))) return null;
  } catch {
    return null;
  }
  return { ownerUserId };
}

export function hasStorefrontPreviewAccess(input: {
  ownerUserId: string;
  storeSlug: string;
  viewerUserId?: string | null;
  previewToken?: string | null;
}): boolean {
  if (input.viewerUserId && input.viewerUserId === input.ownerUserId) {
    return true;
  }

  if (!input.previewToken) {
    return false;
  }

  const preview = verifyStorefrontPreviewToken(input.previewToken, input.storeSlug);
  return Boolean(preview && preview.ownerUserId === input.ownerUserId);
}

export function isStorefrontPreviewTokenConfigured(): boolean {
  return secret() != null;
}

export const storefrontPreviewCookie = { name: COOKIE_NAME } as const;

