import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import { localeAlternateUrl } from "@/lib/storefront/locale-path";
import { storefrontAlternateLocales } from "@/lib/storefront/regional";

import type { BrandSeoOverlay } from "@/lib/storefront/load-brand-for-storefront";

import type { StorefrontPublicPayload } from "./public-access";

export function storefrontCanonicalBase(sf: StorefrontPublicPayload, storeSlug: string): string {
  const mode = sf.primaryDomainMode;
  const root = process.env.NEXT_PUBLIC_STOREFRONT_ROOT_DOMAIN?.replace(/\/$/, "");
  if (mode === "CUSTOM_DOMAIN" && sf.customDomain) {
    return `https://${sf.customDomain.replace(/^https?:\/\//i, "").split("/")[0]}`;
  }
  if (mode === "SUBDOMAIN" && root && sf.subdomain) {
    return `https://${sf.subdomain}.${root}`;
  }
  return `${SITE_URL.replace(/\/$/, "")}/s/${storeSlug}`;
}

export function storefrontCanonicalBaseWithBrand(
  sf: StorefrontPublicPayload,
  storeSlug: string,
  brand?: BrandSeoOverlay | null,
): string {
  const custom = brand?.brandCustomDomain?.trim();
  if (custom) {
    return `https://${custom.replace(/^https?:\/\//i, "").split("/")[0]}`;
  }
  return storefrontCanonicalBase(sf, storeSlug);
}

export function buildStorefrontMetadata(
  sf: StorefrontPublicPayload,
  storeSlug: string,
  opts?: {
    title?: string;
    description?: string;
    path?: string;
    openGraphImage?: string;
    canonicalBase?: string;
    brand?: BrandSeoOverlay | null;
  },
): Metadata {
  const base = opts?.canonicalBase ?? storefrontCanonicalBaseWithBrand(sf, storeSlug, opts?.brand);
  const title = opts?.title ?? opts?.brand?.seoTitle ?? sf.seoTitle ?? sf.publicName;
  const description =
    opts?.description ??
    opts?.brand?.seoDescription ??
    sf.seoDescription ??
    sf.description ??
    `Preorder from ${sf.publicName}`;
  const path = opts?.path ?? "";
  const canonical = `${base}${path}`;

  const primaryLocale = (sf.locale ?? "en").split("-")[0] ?? "en";
  const languages: Record<string, string> = {};
  const pathOnly = path || "";
  for (const code of storefrontAlternateLocales(primaryLocale)) {
    languages[code] = localeAlternateUrl(base, pathOnly, code, primaryLocale);
  }
  languages[primaryLocale] = localeAlternateUrl(base, pathOnly, primaryLocale, primaryLocale);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: Object.keys(languages).length > 1 ? languages : undefined,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: sf.publicName,
      images: opts?.openGraphImage
        ? [{ url: opts.openGraphImage }]
        : opts?.brand?.seoImageUrl || sf.seoImageUrl || sf.heroImageUrl
          ? [{ url: opts?.brand?.seoImageUrl ?? sf.seoImageUrl ?? sf.heroImageUrl! }]
          : undefined,
    },
    robots: sf.robotsPolicy === "noindex" ? { index: false, follow: false } : undefined,
  };
}

export function buildLocalBusinessJsonLd(
  sf: StorefrontPublicPayload,
  storeSlug: string,
  canonicalBase?: string,
) {
  const url = canonicalBase ?? storefrontCanonicalBase(sf, storeSlug);
  const addr = sf.businessAddressJson as Record<string, unknown> | null;
  return {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: sf.publicName,
    url,
    description: sf.description ?? undefined,
    image: sf.heroImageUrl ?? sf.logoUrl ?? undefined,
    telephone: sf.contactPhone ?? undefined,
    email: sf.contactEmail ?? undefined,
    address: addr
      ? {
          "@type": "PostalAddress",
          streetAddress: typeof addr.street === "string" ? addr.street : undefined,
          addressLocality: typeof addr.city === "string" ? addr.city : undefined,
          addressRegion: typeof addr.region === "string" ? addr.region : undefined,
          postalCode: typeof addr.postalCode === "string" ? addr.postalCode : undefined,
          addressCountry: typeof addr.country === "string" ? addr.country : undefined,
        }
      : undefined,
  };
}

/** Minimal Product + Offer JSON-LD for menu items (only fields we know). */
export function buildMenuProductJsonLd(
  sf: StorefrontPublicPayload,
  storeSlug: string,
  product: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    image: string | null;
    /** Public URL segment (slug or id) for canonical Product URL */
    urlPath?: string | null;
  },
  canonicalBase?: string,
) {
  const base = canonicalBase ?? storefrontCanonicalBase(sf, storeSlug);
  const segment = product.urlPath?.trim() || product.id;
  const url = `${base}/products/${encodeURIComponent(segment)}`;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description ?? undefined,
    image: product.image ?? undefined,
    sku: product.id,
    url,
    brand: { "@type": "Brand", name: sf.publicName },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: sf.currency,
      price: String(product.price),
      availability: "https://schema.org/PreOrder",
    },
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildWebPageJsonLd(input: {
  name: string;
  description?: string | null;
  url: string;
  locale?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.name,
    description: input.description ?? undefined,
    url: input.url,
    inLanguage: input.locale ?? "en",
  };
}

/** Collection landing: CollectionPage + ItemList for visible products. */
export function buildCollectionPageJsonLd(input: {
  name: string;
  description?: string | null;
  url: string;
  items: { name: string; url: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description ?? undefined,
    url: input.url,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: input.items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        url: item.url,
      })),
    },
  };
}

export function pageRobotsFromFlags(input: {
  storeRobotsPolicy?: string | null;
  pageRobotsNoindex?: boolean;
  published?: boolean;
  isOwnerPreview?: boolean;
}): { index: boolean; follow: boolean } | undefined {
  if (input.isOwnerPreview && !input.published) {
    return { index: false, follow: false };
  }
  if (input.pageRobotsNoindex) return { index: false, follow: false };
  if (input.storeRobotsPolicy === "noindex") return { index: false, follow: false };
  return undefined;
}
