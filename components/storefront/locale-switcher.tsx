"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { localeAlternateUrl, parseStorefrontInternalPathWithLocale } from "@/lib/storefront/locale-path";
import { STOREFRONT_SUPPORTED_LOCALES } from "@/lib/storefront/regional";

export function StorefrontLocaleSwitcher({
  currentLocale,
  enabledLocales,
  canonicalBase,
  defaultLocale = "en",
}: {
  currentLocale: string;
  enabledLocales?: string[];
  /** When set, uses path-based locale URLs (`/fr/menu`) instead of query only. */
  canonicalBase?: string;
  defaultLocale?: string;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const cur = currentLocale.split("-")[0] ?? "en";

  const options = STOREFRONT_SUPPORTED_LOCALES.filter((l) =>
    enabledLocales?.length ? enabledLocales.includes(l.code) : true,
  );

  if (options.length <= 1) return null;

  function onChange(next: string) {
    document.cookie = `kos-sf-lang=${next};path=/;max-age=31536000;SameSite=Lax`;

    const parsed = pathname.startsWith("/s/") ? parseStorefrontInternalPathWithLocale(pathname) : null;
    if (canonicalBase && parsed) {
      const suffix = parsed.pathSuffix || "";
      const target = localeAlternateUrl(canonicalBase, suffix, next, defaultLocale);
      router.push(target);
      router.refresh();
      return;
    }

    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (next === defaultLocale) {
      params.delete("lang");
    } else {
      params.set("lang", next);
    }
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname);
    router.refresh();
  }

  return (
    <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
      <span className="sr-only">Language</span>
      <select
        value={cur}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-full border border-border/80 bg-background px-2 py-1 text-xs font-medium text-foreground"
        aria-label="Language"
      >
        {options.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
    </label>
  );
}
