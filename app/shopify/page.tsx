import type { Metadata } from "next";

import { ShopifyBundleLanding } from "@/components/marketing/shopify-bundle-landing";
import { marketingPageMetadata } from "@/lib/marketing/page-metadata";
import {
  SHOPIFY_BUNDLE_HEADLINE,
  SHOPIFY_BUNDLE_SUBHEADLINE,
} from "@/lib/marketing/shopify-bundle-content";

export const metadata: Metadata = marketingPageMetadata({
  title: "Shopify + OS Kitchen — Connect Your Store to Kitchen Operations",
  description: `${SHOPIFY_BUNDLE_HEADLINE} ${SHOPIFY_BUNDLE_SUBHEADLINE}`,
  path: "/shopify",
  keywords: [
    "shopify kitchen software",
    "shopify meal prep integration",
    "shopify inventory sync",
    "shopify wholesale kitchen ops",
  ],
});

export default function ShopifyBundlePage() {
  return <ShopifyBundleLanding />;
}
