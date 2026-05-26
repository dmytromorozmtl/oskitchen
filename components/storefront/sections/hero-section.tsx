import Link from "next/link";

import { Button } from "@/components/ui/button";
import { heroSectionSchema, parseSectionContentForLocale } from "@/lib/storefront/sections";
import type { StorefrontPublicPayload } from "@/lib/storefront/public-access";
import type { ThemeCustomizerState } from "@/lib/storefront/theme-draft";

function heroLayoutFromPreset(preset: string | null | undefined): ThemeCustomizerState["heroLayout"] {
  const part = (preset ?? "").split(":")[0]?.trim();
  if (part === "split" || part === "image-first") return part;
  return "centered";
}

export function HeroSection({
  contentJson,
  storeSlug,
  storefront,
  locale,
  defaultLocale,
  orderingPaused,
  heroLayout: heroLayoutProp,
}: {
  contentJson: unknown;
  storeSlug: string;
  storefront: StorefrontPublicPayload;
  locale: string;
  defaultLocale: string;
  orderingPaused?: boolean;
  heroLayout?: ThemeCustomizerState["heroLayout"];
}) {
  const c = parseSectionContentForLocale(heroSectionSchema, contentJson, locale, defaultLocale);
  if (!c) return null;

  const heroLayout = heroLayoutProp ?? heroLayoutFromPreset(storefront.layoutPreset);

  const title = c.headline?.trim() || storefront.publicName;
  const description =
    c.subheadline?.trim() ||
    storefront.tagline?.trim() ||
    storefront.description?.trim() ||
    "Discover our menu and order online.";
  const primaryLabel = c.primaryCtaLabel?.trim() || "View menu";
  const primaryHref = resolveHref(c.primaryCtaHref, storeSlug, "/menu");
  const secondaryLabel = c.secondaryCtaLabel?.trim();
  const secondaryHref = secondaryLabel ? resolveHref(c.secondaryCtaHref, storeSlug, "/contact") : null;
  const imageUrl = c.imageUrl?.trim() || storefront.heroImageUrl?.trim();

  const ctaBlock = (
    <div className="mt-10 flex flex-wrap gap-4">
      {orderingPaused ? (
        <Button size="lg" className="sf-btn-primary" style={{ borderRadius: "var(--sf-button-radius, 9999px)" }} disabled>
          Ordering paused
        </Button>
      ) : (
        <Button asChild size="lg" className="sf-btn-primary" style={{ borderRadius: "var(--sf-button-radius, 9999px)" }}>
          <Link href={primaryHref}>{primaryLabel}</Link>
        </Button>
      )}
      {secondaryLabel && secondaryHref ? (
        <Button
          asChild
          variant="outline"
          size="lg"
          className="dark:border-gray-700 dark:bg-gray-900"
          style={{ borderRadius: "var(--sf-button-radius, 9999px)" }}
        >
          <Link href={secondaryHref}>{secondaryLabel}</Link>
        </Button>
      ) : null}
    </div>
  );

  if (heroLayout === "split" && imageUrl) {
    return (
      <section className="py-6 first:pt-0">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/5 to-transparent dark:border-gray-800 dark:from-primary/10">
          <div className="sf-grid-pattern pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative grid gap-8 p-8 lg:grid-cols-2 lg:items-center lg:p-14">
            <div className="text-left">
              <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground">{description}</p>
              {ctaBlock}
            </div>
            <div className="overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt={c.imageAlt ?? storefront.publicName} className="aspect-[4/3] w-full object-cover" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (heroLayout === "image-first" && imageUrl) {
    return (
      <section className="py-6 first:pt-0">
        <div className="relative overflow-hidden rounded-3xl border border-border/50 dark:border-gray-800">
          <div className="aspect-[21/9] w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={c.imageAlt ?? storefront.publicName} className="h-full w-full object-cover" />
          </div>
          <div className="relative bg-gradient-to-t from-background/95 to-transparent p-8 text-center sm:p-12">
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">{description}</p>
            <div className="flex justify-center">{ctaBlock}</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-6 first:pt-0">
      <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent p-8 text-center dark:border-gray-800 dark:from-primary/15 dark:via-primary/5 dark:to-transparent sm:p-14">
        <div className="sf-grid-pattern pointer-events-none absolute inset-0" aria-hidden />
        {imageUrl ? (
          <div className="relative mx-auto mb-8 max-h-64 overflow-hidden rounded-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={c.imageAlt ?? storefront.publicName} className="max-h-64 w-full object-cover" />
          </div>
        ) : null}
        <div className="relative">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-balance text-muted-foreground">{description}</p>
          {ctaBlock}
        </div>
      </div>
    </section>
  );
}

function resolveHref(href: string | undefined, storeSlug: string, fallback: string): string {
  const h = (href ?? "").trim();
  const base = `/s/${storeSlug}`;
  if (!h || h === "/") return `${base}${fallback.startsWith("/") ? fallback : `/${fallback}`}`;
  if (h.startsWith("http://") || h.startsWith("https://")) return h;
  if (h.startsWith("/")) return h.startsWith(`/s/`) ? h : `${base}${h}`;
  return `${base}/${h}`;
}
