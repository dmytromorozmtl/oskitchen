import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  SHOPIFY_TO_KDS_LANDING_PATH,
  SHOPIFY_TO_KDS_LANDING_META,
  SHOPIFY_TO_KDS_REQUIRED_SECTIONS,
} from "@/lib/marketing/shopify-to-kds-landing-content";

export type ShopifyToKdsLandingAudit = {
  ok: boolean;
  failures: string[];
};

export function auditShopifyToKdsLandingWiring(root = process.cwd()): ShopifyToKdsLandingAudit {
  const failures: string[] = [];
  const paths = [
    "app/shopify-to-kds/page.tsx",
    "components/marketing/shopify-to-kds-landing.tsx",
    "lib/marketing/shopify-to-kds-landing-content.ts",
  ];

  for (const rel of paths) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const componentSource = readFileSync(
    join(root, "components/marketing/shopify-to-kds-landing.tsx"),
    "utf8",
  );
  const contentSource = readFileSync(
    join(root, "lib/marketing/shopify-to-kds-landing-content.ts"),
    "utf8",
  );
  const pageSource = readFileSync(join(root, "app/shopify-to-kds/page.tsx"), "utf8");

  for (const section of SHOPIFY_TO_KDS_REQUIRED_SECTIONS) {
    if (!componentSource.includes(section)) {
      failures.push(`landing component missing section marker: ${section}`);
    }
  }

  if (!contentSource.includes(SHOPIFY_TO_KDS_LANDING_PATH)) {
    failures.push("content missing landing path constant");
  }

  if (!contentSource.includes("shopify to kds")) {
    failures.push("content missing primary SEO keyword");
  }

  if (!pageSource.includes("ShopifyToKdsLanding")) {
    failures.push("page missing ShopifyToKdsLanding component");
  }

  if (!contentSource.includes(SHOPIFY_TO_KDS_LANDING_META.utmCampaign)) {
    failures.push("content missing utm campaign");
  }

  return { ok: failures.length === 0, failures };
}
