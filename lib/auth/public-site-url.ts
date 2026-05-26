/** Production marketing / app origin (no trailing slash). */
export const PRODUCTION_APP_URL = "https://os-kitchen.com";

/**
 * Public site origin for auth redirects, emails, and absolute URLs.
 * Treats empty NEXT_PUBLIC_APP_URL as unset (Vercel misconfig guard).
 */
export function resolvePublicSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");

  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
    return PRODUCTION_APP_URL;
  }

  return "http://localhost:3000";
}

/** Absolute URL for Supabase email / OAuth callbacks. */
export function authCallbackUrl(nextPath?: string): string {
  const base = `${resolvePublicSiteUrl()}/auth/callback`;
  if (!nextPath) return base;
  return `${base}?next=${encodeURIComponent(nextPath)}`;
}
