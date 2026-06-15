import Link from "next/link";
import { Suspense } from "react";
import type { StorefrontSection, StorefrontSectionType } from "@prisma/client";

import { SliderSection } from "@/components/storefront/sections/SliderSection";
import { CateringSection } from "@/components/storefront/sections/catering-section";
import { ContactSection } from "@/components/storefront/sections/contact-section";
import { FAQSection } from "@/components/storefront/sections/faq-section";
import { HeroSection } from "@/components/storefront/sections/hero-section";
import { HowItWorksSection } from "@/components/storefront/sections/how-it-works-section";
import { ProductGridSection } from "@/components/storefront/sections/product-grid-section";
import { ReviewsSection } from "@/components/storefront/sections/reviews-section";
import { TestimonialsSection } from "@/components/storefront/sections/testimonials-section";
import { isMarkdownBody, markdownLiteToHtml } from "@/lib/storefront/markdown-lite";
import { sliderSectionSchema } from "@/lib/storefront/section-schemas/slider";
import { gallerySectionSchema, imageTextSectionSchema, reviewsSectionSchema } from "@/lib/storefront/section-schemas/builder-sections";
import {
  announcementSectionSchema,
  ctaSectionSchema,
  parseSectionContentForLocale,
  textBlockSchema,
} from "@/lib/storefront/sections";
import type { StorefrontPublicPayload } from "@/lib/storefront/public-access";

export type StorefrontSectionRendererProps = {
  section: StorefrontSection;
  storeSlug: string;
  storefront: StorefrontPublicPayload;
  locale?: string;
  defaultLocale?: string;
  orderingPaused?: boolean;
};

export function StorefrontSectionRenderer({
  section,
  storeSlug,
  storefront,
  locale = "en",
  defaultLocale = "en",
  orderingPaused = false,
}: StorefrontSectionRendererProps) {
  if (!section.visible) return null;

  const type = normalizeSectionType(section.type);

  switch (type) {
    case "HERO":
      return (
        <HeroSection
          contentJson={section.contentJson}
          storeSlug={storeSlug}
          storefront={storefront}
          locale={locale}
          defaultLocale={defaultLocale}
          orderingPaused={orderingPaused}
        />
      );
    case "FEATURED_MENU":
    case "PRODUCT_GRID":
      return (
        <Suspense fallback={<SectionSkeleton />}>
          <ProductGridSection
            contentJson={section.contentJson}
            storeSlug={storeSlug}
            storefront={storefront}
            locale={locale}
            defaultLocale={defaultLocale}
          />
        </Suspense>
      );
    case "TEXT_BLOCK": {
      const c = parseSectionContentForLocale(textBlockSchema, section.contentJson, locale, defaultLocale);
      if (c?.heading?.toLowerCase().includes("how it works")) {
        return (
          <HowItWorksSection
            contentJson={section.contentJson}
            storefront={storefront}
            locale={locale}
            defaultLocale={defaultLocale}
          />
        );
      }
      return <GenericTextBlock contentJson={section.contentJson} locale={locale} defaultLocale={defaultLocale} />;
    }
    case "HOW_IT_WORKS":
      return (
        <HowItWorksSection
          contentJson={section.contentJson}
          storefront={storefront}
          locale={locale}
          defaultLocale={defaultLocale}
        />
      );
    case "TESTIMONIALS":
      return (
        <TestimonialsSection contentJson={section.contentJson} locale={locale} defaultLocale={defaultLocale} />
      );
    case "CONTACT_FORM":
    case "CONTACT":
      return (
        <ContactSection
          contentJson={section.contentJson}
          storeSlug={storeSlug}
          storefrontId={storefront.id}
          locale={locale}
          defaultLocale={defaultLocale}
        />
      );
    case "CATERING":
      return (
        <CateringSection
          contentJson={section.contentJson}
          storeSlug={storeSlug}
          locale={locale}
          defaultLocale={defaultLocale}
        />
      );
    case "FAQ":
      return <FAQSection contentJson={section.contentJson} locale={locale} defaultLocale={defaultLocale} />;
    case "REVIEWS":
      return (
        <Suspense fallback={<SectionSkeleton />}>
          <section className="py-6">
            <ReviewsSection
              storefrontId={storefront.id}
              content={parseSectionContentForLocale(reviewsSectionSchema, section.contentJson, locale, defaultLocale) ?? {}}
            />
          </section>
        </Suspense>
      );
    case "SLIDER":
      return <SliderBlock contentJson={section.contentJson} storeSlug={storeSlug} sectionId={section.id} />;
    case "CTA":
      return <CtaBlock contentJson={section.contentJson} storeSlug={storeSlug} locale={locale} defaultLocale={defaultLocale} />;
    case "ANNOUNCEMENT":
      return <AnnouncementBlock contentJson={section.contentJson} locale={locale} defaultLocale={defaultLocale} />;
    case "IMAGE_TEXT":
      return <ImageTextBlock contentJson={section.contentJson} locale={locale} defaultLocale={defaultLocale} />;
    case "GALLERY":
      return <GalleryBlock contentJson={section.contentJson} locale={locale} defaultLocale={defaultLocale} />;
    default:
      return null;
  }
}

/** Alias types used in docs / future builder (not yet in Prisma enum). */
function normalizeSectionType(type: StorefrontSectionType | string): string {
  return String(type);
}

function SectionSkeleton() {
  return <div className="h-40 animate-pulse rounded-2xl bg-muted/60 py-6 dark:bg-gray-800/60" />;
}

function GenericTextBlock({
  contentJson,
  locale,
  defaultLocale,
}: {
  contentJson: unknown;
  locale: string;
  defaultLocale: string;
}) {
  const c = parseSectionContentForLocale(textBlockSchema, contentJson, locale, defaultLocale);
  if (!c) return <Malformed type="TEXT_BLOCK" />;
  return (
    <section className="py-6">
      {c.heading ? <h2 className="text-2xl font-semibold tracking-tight">{c.heading}</h2> : null}
      {isMarkdownBody(c) ? (
        <div
          className="prose prose-neutral mt-3 max-w-none dark:prose-invert text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: markdownLiteToHtml(c.body) }}
        />
      ) : (
        <div className="mt-3 whitespace-pre-wrap text-muted-foreground">{c.body}</div>
      )}
    </section>
  );
}

function SliderBlock({
  contentJson,
  storeSlug,
  sectionId,
}: {
  contentJson: unknown;
  storeSlug: string;
  sectionId: string;
}) {
  const parsed = sliderSectionSchema.safeParse(contentJson);
  if (!parsed.success) return <Malformed type="SLIDER" />;
  return (
    <section className="py-6">
      <SliderSection content={parsed.data} storeSlug={storeSlug} sectionId={sectionId} />
    </section>
  );
}

function CtaBlock({
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
  const c = parseSectionContentForLocale(ctaSectionSchema, contentJson, locale, defaultLocale);
  if (!c) return <Malformed type="CTA" />;
  const base = `/s/${storeSlug}`;
  return (
    <section className="py-6">
      <div className="sf-card rounded-2xl px-6 py-8 text-center sm:px-10 dark:bg-gray-900/80">
        {c.headline ? <h2 className="text-xl font-semibold sm:text-2xl">{c.headline}</h2> : null}
        {c.body ? <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{c.body}</p> : null}
        {c.buttonLabel ? (
          <div className="mt-6">
            <Link href={resolveHref(c.buttonHref, base)} className="inline-flex rounded-full px-6 py-2.5 text-sm font-semibold text-white sf-btn-primary">
              {c.buttonLabel}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function AnnouncementBlock({
  contentJson,
  locale,
  defaultLocale,
}: {
  contentJson: unknown;
  locale: string;
  defaultLocale: string;
}) {
  const c = parseSectionContentForLocale(announcementSectionSchema, contentJson, locale, defaultLocale);
  if (!c) return <Malformed type="ANNOUNCEMENT" />;
  const tone =
    c.tone === "warning"
      ? "border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-50"
      : c.tone === "success"
        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-50"
        : "border-border/80 bg-muted/50 dark:bg-gray-900/50";
  return (
    <section className={`py-6`}>
      <div className={`rounded-xl border px-4 py-3 text-sm ${tone}`}>
        <p className="font-medium">{c.message}</p>
      </div>
    </section>
  );
}

function ImageTextBlock({
  contentJson,
  locale,
  defaultLocale,
}: {
  contentJson: unknown;
  locale: string;
  defaultLocale: string;
}) {
  const c = parseSectionContentForLocale(imageTextSectionSchema, contentJson, locale, defaultLocale);
  if (!c) return <Malformed type="IMAGE_TEXT" />;
  const imgFirst = (c.imagePosition ?? "right") === "left";
  return (
    <section className="py-6">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        {c.imageUrl ? (
          <div className={imgFirst ? "order-1" : "order-2"}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.imageUrl} alt={c.imageAlt ?? ""} className="w-full rounded-2xl object-cover shadow-md" />
          </div>
        ) : null}
        <div className={imgFirst ? "order-2" : "order-1"}>
          {c.heading ? <h2 className="text-2xl font-semibold tracking-tight">{c.heading}</h2> : null}
          <p className="mt-3 whitespace-pre-wrap text-muted-foreground">{c.body}</p>
        </div>
      </div>
    </section>
  );
}

function GalleryBlock({
  contentJson,
  locale,
  defaultLocale,
}: {
  contentJson: unknown;
  locale: string;
  defaultLocale: string;
}) {
  const c = parseSectionContentForLocale(gallerySectionSchema, contentJson, locale, defaultLocale);
  if (!c) return <Malformed type="GALLERY" />;
  return (
    <section className="py-6">
      {c.heading ? <h2 className="mb-6 text-2xl font-semibold tracking-tight">{c.heading}</h2> : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {c.images.map((img, i) => (
          <figure key={i} className="overflow-hidden rounded-2xl border border-border/60 dark:border-gray-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.imageUrl} alt={img.altText} className="aspect-[4/3] w-full object-cover" />
            {img.caption ? <figcaption className="px-3 py-2 text-xs text-muted-foreground">{img.caption}</figcaption> : null}
          </figure>
        ))}
      </div>
    </section>
  );
}

function Malformed({ type }: { type: string }) {
  return (
    <section className="py-6">
      <p className="text-sm text-destructive">This {type} block has invalid content.</p>
    </section>
  );
}

function resolveHref(href: string | undefined, base: string): string {
  const h = (href ?? "").trim();
  if (!h || h === "/") return base;
  if (h.startsWith("http://") || h.startsWith("https://")) return h;
  if (h.startsWith("/")) return h;
  return `${base}/${h}`;
}
