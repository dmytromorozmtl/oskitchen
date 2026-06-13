import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditShopifyToKdsLandingWiring } from "@/lib/marketing/shopify-to-kds-landing-audit";
import {
  SHOPIFY_TO_KDS_LANDING_P3_62_CANONICAL_PATH,
  shopifyToKdsLandingPathsAligned,
} from "@/lib/marketing/shopify-to-kds-landing-p3-62-policy";

export type ShopifyToKdsLandingContractValidation = {
  passed: boolean;
  pathsAligned: boolean;
  sitemapWired: boolean;
  upstreamAuditOk: boolean;
  failures: string[];
};

export function validateShopifyToKdsLandingContract(
  root = process.cwd(),
): ShopifyToKdsLandingContractValidation {
  const failures: string[] = [];

  if (!shopifyToKdsLandingPathsAligned()) {
    failures.push("shopify-to-kds landing path constants are not aligned to /shopify-to-kds");
  }

  let sitemapWired = false;
  const sitemapPath = join(root, "lib/marketing/sitemap-urls.ts");
  if (!existsSync(sitemapPath)) {
    failures.push("missing sitemap-urls.ts");
  } else {
    const source = readFileSync(sitemapPath, "utf8");
    sitemapWired = source.includes(SHOPIFY_TO_KDS_LANDING_P3_62_CANONICAL_PATH);
    if (!sitemapWired) {
      failures.push(`${SHOPIFY_TO_KDS_LANDING_P3_62_CANONICAL_PATH} missing from sitemap-urls.ts`);
    }
  }

  const upstream = auditShopifyToKdsLandingWiring(root);
  if (!upstream.ok) {
    failures.push(...upstream.failures);
  }

  return {
    passed: failures.length === 0 && shopifyToKdsLandingPathsAligned() && upstream.ok,
    pathsAligned: shopifyToKdsLandingPathsAligned(),
    sitemapWired,
    upstreamAuditOk: upstream.ok,
    failures,
  };
}
