import Link from "next/link";

import { StorefrontContactForm } from "@/components/storefront/storefront-contact-form";
import { cateringSectionSchema } from "@/lib/storefront/section-schemas/builder-sections";
import { parseSectionContentForLocale } from "@/lib/storefront/sections";
import { turnstileSiteKey } from "@/lib/storefront/turnstile";

export function CateringSection({
  contentJson,
  storeSlug,
  locale,
  defaultLocale,
}: {
  contentJson: unknown;
  storeSlug: string;
  locale: string;
  defaultLocale: string;
}) {
  const c = parseSectionContentForLocale(cateringSectionSchema, contentJson, locale, defaultLocale);
  if (!c) return null;

  const base = `/s/${storeSlug}`;

  return (
    <section className="py-6">
      <div className="sf-card rounded-2xl p-8 dark:bg-gray-900/80">
        {c.heading ? <h2 className="text-2xl font-semibold tracking-tight">{c.heading}</h2> : null}
        <p className="mt-3 whitespace-pre-wrap text-muted-foreground">{c.body}</p>
        {c.ctaLabel ? (
          <div className="mt-6">
            <Link
              href={resolveHref(c.ctaHref, base)}
              className="inline-flex rounded-full px-6 py-2.5 text-sm font-semibold text-white sf-btn-primary"
            >
              {c.ctaLabel}
            </Link>
          </div>
        ) : (
          <div className="mt-6">
            <StorefrontContactForm storeSlug={storeSlug} type="CATERING" turnstileSiteKey={turnstileSiteKey()} />
          </div>
        )}
      </div>
    </section>
  );
}

function resolveHref(href: string | undefined, base: string): string {
  const h = (href ?? "").trim();
  if (!h || h === "/") return `${base}/catering`;
  if (h.startsWith("http://") || h.startsWith("https://")) return h;
  if (h.startsWith("/")) return h;
  return `${base}/${h}`;
}
