import { StorefrontPageType, StorefrontSectionType, type StorefrontSection } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  parsePageLayoutMeta,
  snapshotsToStorefrontSections,
} from "@/lib/storefront/page-layout-snapshot";
import { resolveSectionContentForLocale } from "@/lib/storefront/localized-content";
import { isTemplateHeroHeadline, isTemplateHeroSubheadline } from "@/lib/storefront/section-placeholders";
import { heroSectionSchema } from "@/lib/storefront/sections";
import type { StorefrontPublicPayload } from "@/lib/storefront/public-access";

function enrichHeroContent(
  raw: unknown,
  sf: StorefrontPublicPayload,
  locale: string,
  defaultLocale: string,
): StorefrontSection["contentJson"] {
  const flat = resolveSectionContentForLocale(raw, locale, defaultLocale);
  const parsed = heroSectionSchema.safeParse(flat);
  const c = parsed.success ? parsed.data : {};

  const headline = isTemplateHeroHeadline(c.headline) ? sf.publicName : (c.headline ?? sf.publicName);
  const subheadline = isTemplateHeroSubheadline(c.subheadline)
    ? sf.tagline?.trim() || sf.description?.trim() || undefined
    : c.subheadline;

  const imageUrl = c.imageUrl?.trim() || sf.heroImageUrl?.trim() || undefined;

  return {
    ...c,
    headline,
    subheadline: subheadline ?? undefined,
    imageUrl,
    primaryCtaLabel: c.primaryCtaLabel?.trim() || "View menu",
    primaryCtaHref: c.primaryCtaHref?.trim() || "/menu",
    secondaryCtaLabel: c.secondaryCtaLabel?.trim() || (sf.contactEmail ? "Contact us" : ""),
    secondaryCtaHref: c.secondaryCtaHref?.trim() || "/contact",
  } as StorefrontSection["contentJson"];
}

function syntheticSection(
  pageId: string,
  type: StorefrontSectionType,
  sortOrder: number,
  contentJson: StorefrontSection["contentJson"],
): StorefrontSection {
  const now = new Date();
  return {
    id: `synthetic-${type}-${sortOrder}`,
    pageId,
    type,
    sortOrder,
    visible: true,
    contentJson,
    createdAt: now,
    updatedAt: now,
  };
}

/** Load HOME page sections for public rendering, enriched with storefront data + sensible defaults. */
export async function getStorefrontHomeSections(input: {
  storefront: StorefrontPublicPayload;
  locale: string;
  defaultLocale: string;
  isOwnerPreview: boolean;
}): Promise<StorefrontSection[]> {
  const { storefront: sf, locale, defaultLocale, isOwnerPreview } = input;

  const homePage = await prisma.storefrontPage.findFirst({
    where: {
      storefrontId: sf.id,
      pageType: StorefrontPageType.HOME,
    },
    include: { sections: { orderBy: { sortOrder: "asc" } } },
  });

  const layoutMeta = parsePageLayoutMeta(homePage?.contentJson);

  let sections: StorefrontSection[];
  if (!isOwnerPreview && layoutMeta.publishedSections?.length && homePage) {
    sections = snapshotsToStorefrontSections(
      layoutMeta.publishedSections.filter((s) => s.visible),
      homePage.id,
    );
  } else if (!isOwnerPreview && !homePage?.published) {
    sections = [];
  } else {
    sections = (homePage?.sections ?? []).filter((s) => s.visible);
  }

  sections = sections.map((s) => {
    if (s.type !== StorefrontSectionType.HERO) return s;
    return {
      ...s,
      contentJson: enrichHeroContent(s.contentJson, sf, locale, defaultLocale),
    };
  });

  const types = new Set(sections.map((s) => s.type));

  const pageId = homePage?.id ?? `synthetic-home-${sf.id}`;

  if (!types.has(StorefrontSectionType.FEATURED_MENU) && sf.activeMenuId) {
    sections.push(
      syntheticSection(pageId, StorefrontSectionType.FEATURED_MENU, 10, {
        heading: "This week's picks",
        subheading: "Highlights from the rotating menu.",
        ctaLabel: "Full menu",
        ctaHref: "/menu",
      }),
    );
  }

  if (!types.has(StorefrontSectionType.TEXT_BLOCK)) {
    sections.push(
      syntheticSection(pageId, StorefrontSectionType.TEXT_BLOCK, 20, {
        heading: "How it works",
        body: buildHowItWorksBody(sf),
        bodyFormat: "plain",
      }),
    );
  }

  if (!types.has(StorefrontSectionType.FAQ)) {
    sections.push(
      syntheticSection(pageId, StorefrontSectionType.FAQ, 30, {
        items: buildDefaultFaqItems(sf),
      }),
    );
  }

  if (!types.has(StorefrontSectionType.CONTACT_FORM) && sf.contactEmail) {
    sections.push(
      syntheticSection(pageId, StorefrontSectionType.CONTACT_FORM, 40, {
        heading: "Contact us",
        body: `Questions? Reach ${sf.publicName} — we usually reply within one business day.`,
      }),
    );
  }

  return sections.sort((a, b) => a.sortOrder - b.sortOrder);
}

function buildHowItWorksBody(sf: StorefrontPublicPayload): string {
  const fulfillment =
    sf.pickupEnabled && sf.deliveryEnabled
      ? "Choose pickup or delivery at checkout when both are available."
      : sf.pickupEnabled
        ? "Pickup is available — select a time slot at checkout."
        : sf.deliveryEnabled
          ? "Delivery may be available — enter your address at checkout."
          : "Check the menu for current fulfillment options.";

  return [
    "Browse the rotating menu and add items to your cart.",
    fulfillment,
    sf.payLaterOnly
      ? "Submit a preorder request — payment is arranged directly with the kitchen."
      : "Complete checkout to place your order.",
  ].join("\n\n");
}

function buildDefaultFaqItems(sf: StorefrontPublicPayload): { q: string; a: string }[] {
  const items: { q: string; a: string }[] = [
    {
      q: "How do I place an order?",
      a: `Visit the menu, add items to your cart, and complete checkout on ${sf.publicName}'s storefront.`,
    },
  ];
  if (sf.contactEmail) {
    items.push({
      q: "How can I reach you?",
      a: `Email us at ${sf.contactEmail} and we'll get back to you as soon as we can.`,
    });
  }
  return items;
}
