const UNSAFE_PROTOCOL = /^\s*(javascript|data|vbscript|file|about):/i;

/** True when href must not be used in anchors (client or server). */
export function isUnsafeHref(href: string): boolean {
  const h = href.trim();
  if (!h) return true;
  if (UNSAFE_PROTOCOL.test(h)) return true;
  const lower = h.toLowerCase();
  if (lower.startsWith("javascript:")) return true;
  return false;
}

/** Normalize internal storefront paths to absolute app paths under `/s/[slug]`. */
export function normalizeInternalStoreHref(storeSlug: string, href: string): string | null {
  const h = href.trim();
  if (!h || isUnsafeHref(h)) return null;
  if (h.startsWith("http://") || h.startsWith("https://")) {
    try {
      const u = new URL(h);
      const prefix = `/s/${storeSlug}`;
      if (u.pathname === prefix || u.pathname.startsWith(`${prefix}/`)) {
        return `${u.pathname}${u.search}${u.hash}`;
      }
      return null;
    } catch {
      return null;
    }
  }
  if (h.startsWith("//")) return null;
  if (h.startsWith("/s/")) {
    const rest = h.slice(3);
    const first = rest.split("/")[0];
    if (first === storeSlug) return h;
    return null;
  }
  if (h.startsWith("/")) {
    return `/s/${storeSlug}${h}`;
  }
  return `/s/${storeSlug}/${h.replace(/^\.\//, "")}`;
}
