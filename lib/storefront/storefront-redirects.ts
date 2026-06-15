/**
 * Storefront path redirects: validation helpers (no DB).
 * Execution is gated by STOREFRONT_REDIRECTS_ENABLED and internal resolve API (see middleware).
 */

export function areStorefrontRedirectsExecutionEnabled(): boolean {
  return process.env.STOREFRONT_REDIRECTS_ENABLED === "true" && Boolean(process.env.STOREFRONT_MIDDLEWARE_SECRET?.trim());
}

/** Normalize storefront-relative path for matching (must start with /). */
export function normalizeStorefrontRelativePath(path: string): string {
  let p = path.trim();
  if (!p.startsWith("/")) p = `/${p}`;
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p || "/";
}

export function parseStorefrontInternalPath(pathname: string): { storeSlug: string; suffix: string } | null {
  if (!pathname.startsWith("/s/")) return null;
  const rest = pathname.slice("/s/".length);
  const i = rest.indexOf("/");
  if (i === -1) {
    const slug = rest;
    return slug ? { storeSlug: slug, suffix: "/" } : null;
  }
  const storeSlug = rest.slice(0, i);
  const tail = rest.slice(i);
  if (!storeSlug) return null;
  return { storeSlug, suffix: normalizeStorefrontRelativePath(tail) };
}

export type RedirectPathValidation =
  | { ok: true }
  | { ok: false; reason: string };

export function validateRedirectFromToPaths(fromPath: string, toPath: string, opts?: { allowExternal?: boolean }): RedirectPathValidation {
  const from = fromPath.trim();
  const to = toPath.trim();
  if (!from.startsWith("/")) return { ok: false, reason: "From path must start with /." };
  if (!to.startsWith("/") && !opts?.allowExternal) {
    if (/^https?:\/\//i.test(to)) return { ok: false, reason: "External redirects are not allowed unless explicitly enabled." };
    return { ok: false, reason: "To path must start with /." };
  }
  if (/^https?:\/\//i.test(to) && !opts?.allowExternal) {
    return { ok: false, reason: "External redirects are not allowed unless explicitly enabled." };
  }
  if (/^javascript:/i.test(from) || /^javascript:/i.test(to)) return { ok: false, reason: "javascript: URLs are not allowed." };
  if (/^data:/i.test(from) || /^data:/i.test(to)) return { ok: false, reason: "data: URLs are not allowed." };
  return { ok: true };
}

/** Detect A→B where B maps back to A (simple 2-cycle) or direct self-loop. */
export function wouldRedirectLoop(fromSuffix: string, toLocationPath: string, reverseFrom?: string | null): boolean {
  const f = normalizeStorefrontRelativePath(fromSuffix);
  const t = normalizeStorefrontRelativePath(toLocationPath.replace(/^\/s\/[^/]+/, "") || "/");
  if (f === t) return true;
  if (reverseFrom && normalizeStorefrontRelativePath(reverseFrom) === t) return true;
  return false;
}

/** When false (default), redirects targeting checkout/order/pay flows are not applied. */
export function storefrontRedirectAllowsSensitivePaths(): boolean {
  return process.env.STOREFRONT_REDIRECT_ALLOW_SENSITIVE_PATHS === "true";
}

/**
 * Storefront paths that must not be redirected away from unless explicitly allowed.
 * Covers payment-adjacent flows; cart/menu remain redirectable.
 */
export function isSensitiveStorefrontRedirectPath(suffix: string): boolean {
  const n = normalizeStorefrontRelativePath(suffix).toLowerCase();
  const blocked = [
    "/checkout",
    "/order",
    "/order-confirmation",
    "/pay",
    "/payment",
    "/stripe",
  ] as const;
  for (const p of blocked) {
    if (n === p || n.startsWith(`${p}/`)) return true;
  }
  return false;
}

/** Optional multi-hop resolution (max depth). Default: single match per request. */
export function storefrontRedirectMaxChainDepth(): number {
  if (process.env.STOREFRONT_REDIRECT_FOLLOW_CHAIN === "true") {
    const raw = Number(process.env.STOREFRONT_REDIRECT_CHAIN_MAX?.trim());
    if (Number.isFinite(raw) && raw >= 1 && raw <= 3) return Math.floor(raw);
    return 3;
  }
  return 1;
}
