import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditRestaurantIntegrationHealthLandingWiring } from "@/lib/marketing/restaurant-integration-health-landing-audit";
import {
  RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_CANONICAL_PATH,
  RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_SALES_PAGE,
  restaurantIntegrationHealthLandingPathsAligned,
} from "@/lib/marketing/restaurant-integration-health-landing-p3-63-policy";

export type RestaurantIntegrationHealthLandingContractValidation = {
  passed: boolean;
  pathsAligned: boolean;
  sitemapWired: boolean;
  salesPageCrossLink: boolean;
  upstreamAuditOk: boolean;
  failures: string[];
};

export function validateRestaurantIntegrationHealthLandingContract(
  root = process.cwd(),
): RestaurantIntegrationHealthLandingContractValidation {
  const failures: string[] = [];

  if (!restaurantIntegrationHealthLandingPathsAligned()) {
    failures.push(
      "restaurant-integration-health landing path constants are not aligned to /restaurant-integration-health",
    );
  }

  let sitemapWired = false;
  const sitemapPath = join(root, "lib/marketing/sitemap-urls.ts");
  if (!existsSync(sitemapPath)) {
    failures.push("missing sitemap-urls.ts");
  } else {
    const source = readFileSync(sitemapPath, "utf8");
    sitemapWired = source.includes(RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_CANONICAL_PATH);
    if (!sitemapWired) {
      failures.push(
        `${RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_CANONICAL_PATH} missing from sitemap-urls.ts`,
      );
    }
  }

  let salesPageCrossLink = false;
  const componentPath = join(root, "components/marketing/restaurant-integration-health-landing.tsx");
  if (!existsSync(componentPath)) {
    failures.push("missing restaurant-integration-health landing component");
  } else {
    const source = readFileSync(componentPath, "utf8");
    salesPageCrossLink = source.includes(RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_SALES_PAGE);
    if (!salesPageCrossLink) {
      failures.push(
        `landing component must cross-link to ${RESTAURANT_INTEGRATION_HEALTH_LANDING_P3_63_SALES_PAGE}`,
      );
    }
  }

  const upstream = auditRestaurantIntegrationHealthLandingWiring(root);
  if (!upstream.ok) {
    failures.push(...upstream.failures);
  }

  return {
    passed: failures.length === 0 && restaurantIntegrationHealthLandingPathsAligned() && upstream.ok,
    pathsAligned: restaurantIntegrationHealthLandingPathsAligned(),
    sitemapWired,
    salesPageCrossLink,
    upstreamAuditOk: upstream.ok,
    failures,
  };
}
