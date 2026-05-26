/** Map a path on a vanity host (apex or custom domain) to the internal `/s/[slug]/…` path. */

import { isStorefrontLocaleCode } from "@/lib/storefront/locale-path";

const BLOCKED_ROOTS = new Set(["api", "_next", "dashboard", "login", "signup", "platform", "onboarding", "admin", "demo"]);

const STOREFRONT_ROOTS = new Set([
  "menu",
  "cart",
  "checkout",
  "about",
  "contact",
  "faq",
  "catering",
  "products",
  "collections",
  "order",
  "order-confirmation",
  "p",
  "policies",
]);

export function mapVanityPathToInternal(
  storeSlug: string,
  pathname: string,
): { internal: string; locale: string | null } | null {
  const p = pathname === "" ? "/" : pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (p === "/") return { internal: `/s/${storeSlug}`, locale: null };

  let parts = p.split("/").filter(Boolean);
  let locale: string | null = null;
  if (parts[0] && isStorefrontLocaleCode(parts[0])) {
    locale = parts[0]!.toLowerCase();
    parts = parts.slice(1);
  }

  if (parts.length === 1 && parts[0]?.toLowerCase() === "robots.txt") {
    return { internal: `/s/${storeSlug}/robots.txt`, locale };
  }
  if (parts.length === 1 && parts[0]?.toLowerCase() === "sitemap.xml") {
    return { internal: `/s/${storeSlug}/sitemap.xml`, locale };
  }
  if (parts[0]?.toLowerCase() === "sitemaps" && parts[1]?.toLowerCase().endsWith(".xml")) {
    const page = parts[1]!.replace(/\.xml$/i, "");
    return { internal: `/s/${storeSlug}/sitemaps/${page}.xml`, locale };
  }

  if (parts.length === 0) {
    return { internal: `/s/${storeSlug}`, locale };
  }

  const root = parts[0]?.toLowerCase();
  if (!root || BLOCKED_ROOTS.has(root)) return null;
  if (!STOREFRONT_ROOTS.has(root)) return null;

  const rest = `/${parts.join("/")}`;
  return { internal: `/s/${storeSlug}${rest}`, locale };
}

export function extractSubdomainStoreSlug(host: string, rootDomain: string): string | null {
  const h = host.split(":")[0]?.toLowerCase() ?? "";
  const root = rootDomain.toLowerCase().replace(/^www\./, "");
  const hostNoPort = h.replace(/^www\./, "");
  if (!hostNoPort.endsWith(`.${root}`)) return null;
  const sub = hostNoPort.slice(0, -(root.length + 1));
  if (!sub || sub.includes(".") || sub === "www") return null;
  if (!/^[a-z0-9-]{2,120}$/i.test(sub)) return null;
  return sub.toLowerCase();
}
