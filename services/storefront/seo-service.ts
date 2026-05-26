import type { Metadata } from "next";

import { buildStorefrontMetadata } from "@/lib/storefront/seo";
import type { StorefrontPublicPayload } from "@/lib/storefront/public-access";
import type { StorefrontSeoSocial } from "@/lib/storefront/theme-draft";

export type StorefrontPageSeoKey = "home" | "menu" | "checkout" | "contact" | "faq" | "catering" | "gift-cards";

const PAGE_TITLES: Record<StorefrontPageSeoKey, (name: string) => string> = {
  home: (n) => n,
  menu: (n) => `Menu — ${n}`,
  checkout: (n) => `Checkout — ${n}`,
  contact: (n) => `Contact — ${n}`,
  faq: (n) => `FAQ — ${n}`,
  catering: (n) => `Catering — ${n}`,
  "gift-cards": (n) => `Gift cards — ${n}`,
};

const PAGE_DESCRIPTIONS: Record<StorefrontPageSeoKey, (name: string, tagline?: string | null) => string> = {
  home: (n, t) => t?.trim() || `Order online from ${n}`,
  menu: (n) => `Browse our menu and order online — ${n}`,
  checkout: (n) => `Complete your order — ${n}`,
  contact: (n) => `Get in touch with ${n}`,
  faq: (n) => `Frequently asked questions — ${n}`,
  catering: (n) => `Catering inquiries — ${n}`,
  "gift-cards": (n) => `Gift cards — ${n}`,
};

/** Rich metadata for public storefront routes (global + per-page overrides). */
export function generateStorefrontMetadata(
  storefront: StorefrontPublicPayload,
  storeSlug: string,
  opts?: {
    page?: StorefrontPageSeoKey;
    path?: string;
    canonicalBase?: string;
    seoSocial?: StorefrontSeoSocial | null;
  },
): Metadata {
  const social = opts?.seoSocial ?? {};
  const page = opts?.page ?? "home";
  const title =
    social.ogTitle?.trim() ||
    storefront.seoTitle?.trim() ||
    PAGE_TITLES[page](storefront.publicName);
  const description =
    social.ogDescription?.trim() ||
    storefront.seoDescription?.trim() ||
    storefront.tagline?.trim() ||
    PAGE_DESCRIPTIONS[page](storefront.publicName, storefront.tagline);

  const path =
    opts?.path ??
    (page === "home" ? "" : page === "menu" ? "/menu" : `/${page}`);

  const base = buildStorefrontMetadata(storefront, storeSlug, {
    title,
    description,
    path,
    canonicalBase: opts?.canonicalBase,
    openGraphImage: storefront.seoImageUrl ?? storefront.heroImageUrl ?? undefined,
  });

  const twitterTitle = social.twitterTitle?.trim() || title;
  const twitterDescription = social.twitterDescription?.trim() || description;

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      title: social.ogTitle?.trim() || (typeof base.openGraph?.title === "string" ? base.openGraph.title : title),
      description:
        social.ogDescription?.trim() ||
        (typeof base.openGraph?.description === "string" ? base.openGraph.description : description),
    },
    twitter: {
      card: "summary_large_image",
      title: twitterTitle,
      description: twitterDescription,
    },
  };
}
