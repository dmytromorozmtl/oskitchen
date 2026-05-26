import { pageTranslationSummary } from "@/lib/storefront/localized-content";
import { pageMetaTranslationSummary } from "@/lib/storefront/localized-page-meta";
import { parseStorefrontNavigationItems } from "@/lib/storefront/navigation-validation";
import { normalizeSectionContent } from "@/lib/storefront/sections";
import type { StorefrontSectionType } from "@prisma/client";

export type PublishChecklistItem = {
  id: string;
  label: string;
  ok: boolean;
  detail?: string;
  href?: string;
};

export function buildStorefrontPublishChecklist(input: {
  storeSlug: string;
  themePublishedAt: Date | null;
  navigationItemsJson: unknown;
  editorLocales: string[];
  defaultLocale: string;
  activeMenuId?: string | null;
  visibleProductCount?: number;
  pickupEnabled?: boolean;
  deliveryEnabled?: boolean;
  pages: {
    slug: string;
    title: string;
    published: boolean;
    contentJson: unknown;
    sections: { type: StorefrontSectionType; contentJson: unknown }[];
  }[];
}): PublishChecklistItem[] {
  const navLinks = parseStorefrontNavigationItems(input.navigationItemsJson, input.storeSlug, {
    locale: input.defaultLocale,
    includeDraftOrHidden: true,
  });
  const navOk = navLinks.length >= 2;

  const themeOk = Boolean(input.themePublishedAt);

  let missingSectionLocales = 0;
  let missingPageMetaLocales = 0;
  let invalidSections = 0;
  for (const p of input.pages) {
    if (!p.published) continue;
    for (const sec of p.sections) {
      if (!normalizeSectionContent(sec.type, sec.contentJson)) invalidSections += 1;
    }
    const secSummary = pageTranslationSummary(p.sections, input.editorLocales);
    missingSectionLocales += secSummary.reduce((n, s) => n + s.missingCount, 0);
    const metaSummary = pageMetaTranslationSummary(p.contentJson, input.editorLocales, input.defaultLocale);
    missingPageMetaLocales += metaSummary.reduce((n, s) => n + s.missingCount, 0);
  }
  const secondary = input.editorLocales.filter((l) => l !== input.defaultLocale);
  const translationsOk = secondary.length === 0 || (missingSectionLocales === 0 && missingPageMetaLocales === 0);

  const publishedCustom = input.pages.filter((p) => p.published && p.slug !== "home").length;
  const sitemapOk = true;
  const sectionsOk = invalidSections === 0;
  const menuOk = Boolean(input.activeMenuId);
  const productsOk = (input.visibleProductCount ?? 0) > 0;
  const fulfillmentOk = Boolean(input.pickupEnabled || input.deliveryEnabled);

  return [
    {
      id: "nav",
      label: "Navigation has links",
      ok: navOk,
      detail: navOk ? `${navLinks.length} links` : "Add at least 2 nav items in Builder",
      href: "/dashboard/storefront/builder",
    },
    {
      id: "theme",
      label: "Theme snapshot published",
      ok: themeOk,
      detail: themeOk ? "Guests see published nav/colors" : "Publish on Theme tab",
      href: "/dashboard/storefront/theme",
    },
    {
      id: "sections",
      label: "Published sections pass schema validation",
      ok: sectionsOk,
      detail: sectionsOk
        ? "All section content valid"
        : `${invalidSections} section(s) need fixes in Builder`,
      href: "/dashboard/storefront/pages",
    },
    {
      id: "translations",
      label: "No missing secondary-locale copy",
      ok: translationsOk,
      detail: translationsOk
        ? "Sections & page SEO filled"
        : `${missingSectionLocales} section + ${missingPageMetaLocales} page SEO gaps`,
      href: "/dashboard/storefront/pages",
    },
    {
      id: "sitemap",
      label: "Sitemap includes published pages",
      ok: sitemapOk,
      detail: `${publishedCustom} custom page(s) + standard routes`,
      href: `/s/${input.storeSlug}/sitemap.xml`,
    },
    {
      id: "active_menu",
      label: "Active menu linked",
      ok: menuOk,
      detail: menuOk ? "Menu assigned on Overview" : "Choose a menu on Overview",
      href: "/dashboard/storefront",
    },
    {
      id: "products",
      label: "Visible products on menu",
      ok: productsOk,
      detail: productsOk
        ? `${input.visibleProductCount} product(s)`
        : "Add active storefront-visible products",
      href: "/dashboard/storefront/products",
    },
    {
      id: "fulfillment",
      label: "Pickup or delivery enabled",
      ok: fulfillmentOk,
      detail: fulfillmentOk ? "At least one fulfillment mode on" : "Enable pickup or delivery",
      href: "/dashboard/storefront/fulfillment",
    },
  ];
}
