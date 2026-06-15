/** Detect storefront checkout from middleware-injected pathname (falls back to false if header missing). */
export function isStorefrontCheckoutPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return /^\/s\/[^/]+\/checkout(?:\/|$)/.test(pathname);
}
