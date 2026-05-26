import type { Metadata } from "next";

import { SITE_URL } from "@/lib/constants";
import { DEFAULT_OG_IMAGE_PATH, OG_IMAGE_SIZE } from "@/lib/seo/og-image";

/** Per-route marketing metadata with canonical, Open Graph, and Twitter cards. */
export function marketingPageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogImage?: string;
  /** Paid / campaign pages — keep out of organic index. */
  noIndex?: boolean;
}): Metadata {
  const canonicalPath = opts.path === "/" ? "/" : opts.path;
  const url = canonicalPath === "/" ? SITE_URL : `${SITE_URL}${canonicalPath}`;
  const ogImage = opts.ogImage ?? DEFAULT_OG_IMAGE_PATH;
  const ogImageUrl = ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`;

  return {
    title: opts.title,
    description: opts.description,
    ...(opts.keywords?.length ? { keywords: opts.keywords } : {}),
    ...(opts.noIndex
      ? { robots: { index: false, follow: true, googleBot: { index: false, follow: true } } }
      : {}),
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      type: "website",
      locale: "en_US",
      images: [
        {
          url: ogImageUrl,
          width: OG_IMAGE_SIZE.width,
          height: OG_IMAGE_SIZE.height,
          alt: opts.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: [ogImageUrl],
    },
  };
}
