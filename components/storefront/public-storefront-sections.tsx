import Link from "next/link";
import { Suspense } from "react";
import type { StorefrontSection, StorefrontSectionType } from "@prisma/client";

import { SliderSection } from "@/components/storefront/sections/SliderSection";
import { ContactFormSection } from "@/components/storefront/sections/contact-form-section";
import { FeaturedMenuSection } from "@/components/storefront/sections/featured-menu-section";
import { ReviewsSection } from "@/components/storefront/sections/reviews-section";
import { StorefrontContactForm } from "@/components/storefront/storefront-contact-form";
import { isMarkdownBody, markdownLiteToHtml } from "@/lib/storefront/markdown-lite";
import { sliderSectionSchema } from "@/lib/storefront/section-schemas/slider";
import {
  cateringSectionSchema,
  contactFormSectionSchema,
  featuredMenuSectionSchema,
  gallerySectionSchema,
  imageTextSectionSchema,
  reviewsSectionSchema,
  testimonialsSectionSchema,
} from "@/lib/storefront/section-schemas/builder-sections";
import {
  announcementSectionSchema,
  ctaSectionSchema,
  faqSectionSchema,
  heroSectionSchema,
  parseSectionContentForLocale,
  textBlockSchema,
} from "@/lib/storefront/sections";
import { turnstileSiteKey } from "@/lib/storefront/turnstile";

function SectionShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`py-6 first:pt-0 ${className}`.trim()}>{children}</section>;
}

function SectionSkeleton() {
  return <div className="h-40 animate-pulse rounded-2xl bg-muted/60 dark:bg-gray-800/60" />;
}

export function PublicStorefrontSections({
  sections,
  storeSlug,
  storefrontId,
  currency,
  activeMenuId,
  locale = "en",
  defaultLocale = "en",
}: {
  sections: StorefrontSection[];
  storeSlug: string;
  storefrontId: string;
  currency: string;
  activeMenuId: string | null;
  locale?: string;
  defaultLocale?: string;
}) {
  const base = `/s/${storeSlug}`;
  const visible = sections.filter((s) => s.visible);

  return (
    <div className="space-y-4">
      {visible.map((section) => (
        <SectionBlock
          key={section.id}
          section={section}
          base={base}
          storeSlug={storeSlug}
          storefrontId={storefrontId}
          currency={currency}
          activeMenuId={activeMenuId}
          locale={locale}
          defaultLocale={defaultLocale}
        />
      ))}
    </div>
  );
}

function SectionBlock({
  section,
  base,
  storeSlug,
  storefrontId,
  currency,
  activeMenuId,
  locale,
  defaultLocale,
}: {
  section: StorefrontSection;
  base: string;
  storeSlug: string;
  storefrontId: string;
  currency: string;
  activeMenuId: string | null;
  locale: string;
  defaultLocale: string;
}) {
  const raw = section.contentJson;
  switch (section.type) {
    case "HERO": {
      const c = parseSectionContentForLocale(heroSectionSchema, raw, locale, defaultLocale);
      if (!c) return <Malformed type={section.type} />;
      return (
        <SectionShell>
          <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent p-8 text-center dark:border-gray-800 dark:from-primary/15 dark:via-primary/5 dark:to-transparent sm:p-14">
            <div className="sf-grid-pattern pointer-events-none absolute inset-0" aria-hidden />
            <div className="relative">
              {c.imageUrl ? (
                <div className="mx-auto mb-8 max-h-56 overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.imageUrl} alt={c.imageAlt ?? ""} className="max-h-56 w-full object-cover" />
                </div>
              ) : null}
              {c.headline ? (
                <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  {c.headline}
                </h1>
              ) : null}
              {c.subheadline ? (
                <p className="mx-auto mt-6 max-w-2xl text-lg text-balance text-muted-foreground">{c.subheadline}</p>
              ) : null}
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                {c.primaryCtaLabel ? (
                  <Link
                    href={resolveHref(c.primaryCtaHref, base)}
                    className="inline-flex items-center justify-center rounded-full px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary/20 transition hover:brightness-105 sf-btn-primary"
                  >
                    {c.primaryCtaLabel}
                  </Link>
                ) : null}
                {c.secondaryCtaLabel ? (
                  <Link
                    href={resolveHref(c.secondaryCtaHref, base)}
                    className="inline-flex items-center justify-center rounded-full border border-border bg-background px-8 py-3.5 text-base font-medium transition hover:bg-muted dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                  >
                    {c.secondaryCtaLabel}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </SectionShell>
      );
    }
    case "TEXT_BLOCK": {
      const c = parseSectionContentForLocale(textBlockSchema, raw, locale, defaultLocale);
      if (!c) return <Malformed type={section.type} />;
      return (
        <SectionShell>
          {c.heading ? <h2 className="text-2xl font-semibold tracking-tight">{c.heading}</h2> : null}
          {isMarkdownBody(c) ? (
            <div
              className="prose prose-neutral mt-3 max-w-none text-muted-foreground dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: markdownLiteToHtml(c.body) }}
            />
          ) : (
            <div className="mt-3 whitespace-pre-wrap text-muted-foreground">{c.body}</div>
          )}
        </SectionShell>
      );
    }
    case "CTA": {
      const c = parseSectionContentForLocale(ctaSectionSchema, raw, locale, defaultLocale);
      if (!c) return <Malformed type={section.type} />;
      return (
        <SectionShell className="sf-card rounded-2xl px-6 py-8 text-center sm:px-10">
          {c.headline ? <h2 className="text-xl font-semibold sm:text-2xl">{c.headline}</h2> : null}
          {c.body ? <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{c.body}</p> : null}
          {c.buttonLabel ? (
            <div className="mt-6">
              <Link
                href={resolveHref(c.buttonHref, base)}
                className="inline-flex rounded-full px-6 py-2.5 text-sm font-semibold text-white sf-btn-primary"
              >
                {c.buttonLabel}
              </Link>
            </div>
          ) : null}
        </SectionShell>
      );
    }
    case "ANNOUNCEMENT": {
      const c = parseSectionContentForLocale(announcementSectionSchema, raw, locale, defaultLocale);
      if (!c) return <Malformed type={section.type} />;
      const tone =
        c.tone === "warning"
          ? "border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-50"
          : c.tone === "success"
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-50"
            : "border-border/80 bg-muted/50 dark:bg-gray-900/50";
      return (
        <SectionShell className={`rounded-xl border px-4 py-3 text-sm ${tone}`}>
          <p className="font-medium">{c.message}</p>
        </SectionShell>
      );
    }
    case "FAQ": {
      const c = parseSectionContentForLocale(faqSectionSchema, raw, locale, defaultLocale);
      if (!c) return <Malformed type={section.type} />;
      return (
        <SectionShell>
          <h2 className="text-2xl font-semibold tracking-tight">FAQ</h2>
          <dl className="mt-4 space-y-3">
            {c.items.map((item, i) => (
              <div key={i} className="sf-card rounded-xl px-4 py-4 dark:bg-gray-900/70">
                <dt className="font-medium">{item.q}</dt>
                <dd className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{item.a}</dd>
              </div>
            ))}
          </dl>
        </SectionShell>
      );
    }
    case "SLIDER": {
      const parsed = sliderSectionSchema.safeParse(raw);
      if (!parsed.success) return <Malformed type={section.type} />;
      return (
        <SectionShell>
          <SliderSection content={parsed.data} storeSlug={storeSlug} sectionId={section.id} />
        </SectionShell>
      );
    }
    case "FEATURED_MENU": {
      const c = parseSectionContentForLocale(featuredMenuSectionSchema, raw, locale, defaultLocale);
      if (!c) return <Malformed type={section.type} />;
      return (
        <SectionShell>
          <Suspense fallback={<SectionSkeleton />}>
            <FeaturedMenuSection
              storefrontId={storefrontId}
              storeSlug={storeSlug}
              currency={currency}
              activeMenuId={activeMenuId}
              content={c}
            />
          </Suspense>
        </SectionShell>
      );
    }
    case "IMAGE_TEXT": {
      const c = parseSectionContentForLocale(imageTextSectionSchema, raw, locale, defaultLocale);
      if (!c) return <Malformed type={section.type} />;
      const imgFirst = (c.imagePosition ?? "right") === "left";
      return (
        <SectionShell>
          <div className={`grid gap-8 lg:grid-cols-2 lg:items-center ${imgFirst ? "" : ""}`}>
            {c.imageUrl ? (
              <div className={imgFirst ? "order-1" : "order-2 lg:order-2"}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.imageUrl}
                  alt={c.imageAlt ?? ""}
                  className="w-full rounded-2xl object-cover shadow-md dark:shadow-gray-950/50"
                />
              </div>
            ) : null}
            <div className={imgFirst ? "order-2" : "order-1 lg:order-1"}>
              {c.heading ? <h2 className="text-2xl font-semibold tracking-tight">{c.heading}</h2> : null}
              <p className="mt-3 whitespace-pre-wrap text-muted-foreground">{c.body}</p>
            </div>
          </div>
        </SectionShell>
      );
    }
    case "TESTIMONIALS": {
      const c = parseSectionContentForLocale(testimonialsSectionSchema, raw, locale, defaultLocale);
      if (!c) return <Malformed type={section.type} />;
      return (
        <SectionShell>
          <h2 className="text-center text-2xl font-semibold tracking-tight">
            {c.heading?.trim() || "What guests say"}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {c.items.map((item, i) => (
              <blockquote
                key={i}
                className="sf-card rounded-2xl p-6 dark:bg-gray-900/80"
              >
                <p className="text-sm leading-relaxed text-foreground/90">&ldquo;{item.quote}&rdquo;</p>
                {(item.author || item.role) && (
                  <footer className="mt-4 text-xs text-muted-foreground">
                    {item.author ? <span className="font-medium text-foreground">{item.author}</span> : null}
                    {item.role ? <span>{item.author ? " · " : ""}{item.role}</span> : null}
                  </footer>
                )}
              </blockquote>
            ))}
          </div>
        </SectionShell>
      );
    }
    case "GALLERY": {
      const c = parseSectionContentForLocale(gallerySectionSchema, raw, locale, defaultLocale);
      if (!c) return <Malformed type={section.type} />;
      return (
        <SectionShell>
          {c.heading ? <h2 className="mb-6 text-2xl font-semibold tracking-tight">{c.heading}</h2> : null}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {c.images.map((img, i) => (
              <figure key={i} className="overflow-hidden rounded-2xl border border-border/60 dark:border-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.imageUrl} alt={img.altText} className="aspect-[4/3] w-full object-cover" />
                {img.caption ? (
                  <figcaption className="px-3 py-2 text-xs text-muted-foreground">{img.caption}</figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </SectionShell>
      );
    }
    case "CATERING": {
      const c = parseSectionContentForLocale(cateringSectionSchema, raw, locale, defaultLocale);
      if (!c) return <Malformed type={section.type} />;
      return (
        <SectionShell className="sf-card rounded-2xl p-8 dark:bg-gray-900/80">
          {c.heading ? <h2 className="text-2xl font-semibold tracking-tight">{c.heading}</h2> : null}
          <p className="mt-3 whitespace-pre-wrap text-muted-foreground">{c.body}</p>
          {c.ctaLabel ? (
            <div className="mt-6">
              <Link
                href={resolveHref(c.ctaHref, `${base}/catering`)}
                className="inline-flex rounded-full px-6 py-2.5 text-sm font-semibold text-white sf-btn-primary"
              >
                {c.ctaLabel}
              </Link>
            </div>
          ) : (
            <div className="mt-6">
              <StorefrontContactForm
                storeSlug={storeSlug}
                type="CATERING"
                turnstileSiteKey={turnstileSiteKey()}
              />
            </div>
          )}
        </SectionShell>
      );
    }
    case "CONTACT_FORM": {
      const c = parseSectionContentForLocale(contactFormSectionSchema, raw, locale, defaultLocale);
      if (!c) return <Malformed type={section.type} />;
      return (
        <SectionShell>
          <Suspense fallback={<SectionSkeleton />}>
            <ContactFormSection storefrontId={storefrontId} storeSlug={storeSlug} content={c} />
          </Suspense>
        </SectionShell>
      );
    }
    case "REVIEWS": {
      const c = parseSectionContentForLocale(reviewsSectionSchema, raw, locale, defaultLocale);
      if (!c) return <Malformed type={section.type} />;
      return (
        <SectionShell>
          <Suspense fallback={<SectionSkeleton />}>
            <ReviewsSection storefrontId={storefrontId} content={c} />
          </Suspense>
        </SectionShell>
      );
    }
    default:
      return (
        <SectionShell>
          <p className="text-xs font-mono text-muted-foreground">{section.type}</p>
        </SectionShell>
      );
  }
}

function Malformed({ type }: { type: StorefrontSectionType }) {
  return (
    <SectionShell>
      <p className="text-sm text-destructive">This {type} block has invalid content JSON.</p>
    </SectionShell>
  );
}

function resolveHref(href: string | undefined, base: string): string {
  const h = (href ?? "").trim();
  if (!h || h === "/") return base;
  if (h.startsWith("http://") || h.startsWith("https://")) return h;
  if (h.startsWith("/")) return h;
  return `${base}/${h}`;
}
