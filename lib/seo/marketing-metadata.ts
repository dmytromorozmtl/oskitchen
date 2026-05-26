import type { Metadata } from "next";

import { APP_NAME } from "@/lib/constants";
import { PRODUCTION_APP_URL } from "@/lib/auth/public-site-url";

type MarketingMetaInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
};

/** Consistent Open Graph + Twitter for public marketing routes. */
export function marketingMetadata(input: MarketingMetaInput): Metadata {
  const url = `${PRODUCTION_APP_URL}${input.path.startsWith("/") ? input.path : `/${input.path}`}`;
  const title = input.title.includes(APP_NAME) ? input.title : `${input.title} · ${APP_NAME}`;

  return {
    title,
    description: input.description,
    keywords: input.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description: input.description,
      siteName: APP_NAME,
      locale: "en_US",
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: input.description,
      images: ["/opengraph-image"],
    },
  };
}
