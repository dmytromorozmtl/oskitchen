import { STOREFRONT_SUPPORTED_LOCALES } from "@/lib/storefront/regional";

const LOCALE_CODES = new Set(STOREFRONT_SUPPORTED_LOCALES.map((l) => l.code));

export function isStorefrontLocaleCode(code: string): boolean {
  const c = code.split("-")[0]?.toLowerCase() ?? "";
  return (LOCALE_CODES as Set<string>).has(c);
}

/** `/s/my-store/fr/menu` → `{ storeSlug, locale: 'fr', pathSuffix: '/menu' }` */
export function parseStorefrontInternalPathWithLocale(pathname: string): {
  storeSlug: string;
  locale: string | null;
  pathSuffix: string;
} | null {
  const m = pathname.match(/^\/s\/([^/]+)(?:\/([^/]+))?(.*)$/);
  if (!m) return null;
  const storeSlug = m[1]!;
  const maybeLocale = m[2];
  const rest = m[3] ?? "";
  if (maybeLocale && isStorefrontLocaleCode(maybeLocale)) {
    return { storeSlug, locale: maybeLocale.split("-")[0]!.toLowerCase(), pathSuffix: rest || "" };
  }
  return { storeSlug, locale: null, pathSuffix: maybeLocale ? `/${maybeLocale}${rest}` : rest || "" };
}

/** Rewrite `/s/slug/fr/menu` → `/s/slug/menu` and return locale for cookie. */
export function stripLocalePrefixFromInternalPath(pathname: string): {
  rewritten: string;
  locale: string | null;
} {
  const parsed = parseStorefrontInternalPathWithLocale(pathname);
  if (!parsed?.locale) return { rewritten: pathname, locale: null };
  const suffix = parsed.pathSuffix || "";
  const rewritten = `/s/${parsed.storeSlug}${suffix === "" ? "" : suffix.startsWith("/") ? suffix : `/${suffix}`}`;
  return { rewritten, locale: parsed.locale };
}

/** Build alternate URL on canonical base (works for `/s/slug` and custom domains). */
export function localeAlternateUrl(
  canonicalBase: string,
  pathSuffix: string,
  locale: string,
  defaultLocale: string,
): string {
  const base = canonicalBase.replace(/\/$/, "");
  const loc = locale.split("-")[0]?.toLowerCase() ?? defaultLocale;
  const def = defaultLocale.split("-")[0]?.toLowerCase() ?? "en";
  const suffix = pathSuffix === "" ? "" : pathSuffix.startsWith("/") ? pathSuffix : `/${pathSuffix}`;
  if (loc === def) return `${base}${suffix}`;
  return `${base}/${loc}${suffix}`;
}

export function withStorefrontLocalePath(
  storeSlug: string,
  pathSuffix: string,
  locale: string,
  defaultLocale: string,
): string {
  const loc = locale.split("-")[0]?.toLowerCase() ?? defaultLocale;
  const def = defaultLocale.split("-")[0]?.toLowerCase() ?? "en";
  const suffix = pathSuffix.startsWith("/") ? pathSuffix : pathSuffix ? `/${pathSuffix}` : "";
  const base = `/s/${storeSlug}`;
  if (loc === def) return `${base}${suffix}`;
  return `${base}/${loc}${suffix}`;
}
