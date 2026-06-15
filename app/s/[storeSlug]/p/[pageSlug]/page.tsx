import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StorefrontSectionRenderer } from "@/components/storefront/section-renderer";
import { getStorefrontForPublicFromRequest, isStorefrontInClosureWindow } from "@/lib/storefront/public-access";
import { StorefrontFormRenderer } from "@/components/storefront/forms/storefront-form-renderer";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { primaryLocaleForStorefront } from "@/lib/storefront/localized-content";
import { resolvePageMetaForLocale } from "@/lib/storefront/localized-page-meta";
import { resolveStorefrontLocaleFromRequest } from "@/lib/storefront/resolve-locale";
import { loadPublicStorefrontPage } from "@/lib/storefront/public-storefront-brand";
import { promoteScheduledStorefrontPages } from "@/lib/storefront/page-schedule";
import { StorefrontBreadcrumbs } from "@/components/storefront/storefront-breadcrumbs";
import { buildStorefrontMetadata, buildWebPageJsonLd, pageRobotsFromFlags } from "@/lib/storefront/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ storeSlug: string; pageSlug: string }>;
}): Promise<Metadata> {
  const { storeSlug, pageSlug } = await params;
  const bundle = await loadPublicStorefrontPage(storeSlug);
  if (!bundle) return { title: "Page" };
  const { sf, canonicalBase, brandOverlay } = bundle;
  const page = await prisma.storefrontPage.findFirst({
    where: { storefrontId: sf.id, slug: pageSlug, published: true },
  });
  if (!page) return { title: sf.publicName };
  const locale = await resolveStorefrontLocaleFromRequest(sf.locale);
  const defaultLocale = primaryLocaleForStorefront(sf.locale);
  const meta = resolvePageMetaForLocale(page.contentJson, locale, defaultLocale, {
    title: page.title,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
    seoOgImageUrl: null,
  });
  const md = buildStorefrontMetadata(sf, storeSlug, {
    title: meta.seoTitle ?? meta.title ?? page.title,
    description: meta.seoDescription ?? undefined,
    path: `/p/${pageSlug}`,
    openGraphImage: meta.seoOgImageUrl ?? undefined,
    canonicalBase,
    brand: brandOverlay,
  });
  const robots = pageRobotsFromFlags({
    storeRobotsPolicy: sf.robotsPolicy,
    pageRobotsNoindex: page.robotsNoindex,
    published: page.published,
  });
  return robots ? { ...md, robots } : md;
}

export default async function StorefrontCustomPage({
  params,
}: {
  params: Promise<{ storeSlug: string; pageSlug: string }>;
}) {
  const { storeSlug, pageSlug } = await params;
  const user = await getSessionUser();
  const bundle = await loadPublicStorefrontPage(storeSlug, user?.id ?? null);
  if (!bundle) notFound();
  const { sf, canonicalBase } = bundle;

  await promoteScheduledStorefrontPages(sf.id);

  const isOwnerPreview = user?.id === sf.userId;
  const page = await prisma.storefrontPage.findFirst({
    where: {
      storefrontId: sf.id,
      slug: pageSlug,
      ...(isOwnerPreview ? {} : { published: true }),
    },
    include: { sections: { orderBy: { sortOrder: "asc" } }, linkedForm: true },
  });
  if (!page) notFound();

  const locale = await resolveStorefrontLocaleFromRequest(sf.locale);
  const defaultLocale = primaryLocaleForStorefront(sf.locale);
  const pageMeta = resolvePageMetaForLocale(page.contentJson, locale, defaultLocale, {
    title: page.title,
    seoTitle: page.seoTitle,
    seoDescription: page.seoDescription,
  });

  const content = page.contentJson as { html?: string; body?: string };
  const legacyBody =
    typeof content.body === "string" ? content.body : typeof content.html === "string" ? content.html : null;

  const base = canonicalBase;
  const pageUrl = `${base.replace(/\/$/, "")}/p/${encodeURIComponent(pageSlug)}`;
  const webPageLd = buildWebPageJsonLd({
    name: pageMeta.title ?? page.title,
    description: pageMeta.seoDescription,
    url: pageUrl,
    locale,
  });

  const menuHref = `/s/${storeSlug}/menu`;

  return (
    <article className="max-w-3xl space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageLd) }} />
      <StorefrontBreadcrumbs
        items={[
          { label: sf.publicName, href: menuHref },
          { label: pageMeta.title ?? page.title },
        ]}
        jsonLdBase={[
          { name: sf.publicName, url: base.replace(/\/$/, "") },
          { name: pageMeta.title ?? page.title, url: pageUrl },
        ]}
      />
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{pageMeta.title ?? page.title}</h1>
        {!page.published && isOwnerPreview ? (
          <p className="mt-2 text-sm font-medium text-amber-800 dark:text-amber-200">Draft — only you see this while signed in.</p>
        ) : null}
      </header>

      {page.sections
        .filter((s) => s.visible)
        .map((section) => (
          <StorefrontSectionRenderer
            key={section.id}
            section={section}
            storeSlug={storeSlug}
            storefront={sf}
            locale={locale}
            defaultLocale={defaultLocale}
            orderingPaused={isStorefrontInClosureWindow(sf)}
          />
        ))}

      {legacyBody ? (
        <div className="prose prose-neutral dark:prose-invert max-w-none border-t border-border/60 pt-8">
          <h2 className="text-lg font-semibold">Additional note</h2>
          <div className="whitespace-pre-wrap text-muted-foreground">{legacyBody}</div>
        </div>
      ) : null}

      {page.linkedForm && page.linkedForm.active && !page.linkedForm.archived ? (
        <div className="border-t border-border/60 pt-8">
          <h2 className="mb-4 text-lg font-semibold">Get in touch</h2>
          <StorefrontFormRenderer form={page.linkedForm} storeSlug={storeSlug} />
        </div>
      ) : null}
    </article>
  );
}
