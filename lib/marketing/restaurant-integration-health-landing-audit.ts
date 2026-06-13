import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  RESTAURANT_INTEGRATION_HEALTH_LANDING_META,
  RESTAURANT_INTEGRATION_HEALTH_LANDING_PATH,
  RESTAURANT_INTEGRATION_HEALTH_REQUIRED_SECTIONS,
} from "@/lib/marketing/restaurant-integration-health-landing-content";

export type RestaurantIntegrationHealthLandingAudit = {
  ok: boolean;
  failures: string[];
};

export function auditRestaurantIntegrationHealthLandingWiring(
  root = process.cwd(),
): RestaurantIntegrationHealthLandingAudit {
  const failures: string[] = [];
  const paths = [
    "app/restaurant-integration-health/page.tsx",
    "components/marketing/restaurant-integration-health-landing.tsx",
    "lib/marketing/restaurant-integration-health-landing-content.ts",
  ];

  for (const rel of paths) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const componentSource = readFileSync(
    join(root, "components/marketing/restaurant-integration-health-landing.tsx"),
    "utf8",
  );
  const contentSource = readFileSync(
    join(root, "lib/marketing/restaurant-integration-health-landing-content.ts"),
    "utf8",
  );
  const pageSource = readFileSync(
    join(root, "app/restaurant-integration-health/page.tsx"),
    "utf8",
  );

  for (const section of RESTAURANT_INTEGRATION_HEALTH_REQUIRED_SECTIONS) {
    if (!componentSource.includes(section)) {
      failures.push(`landing component missing section marker: ${section}`);
    }
  }

  if (!contentSource.includes(RESTAURANT_INTEGRATION_HEALTH_LANDING_PATH)) {
    failures.push("content missing landing path constant");
  }

  if (!contentSource.includes("restaurant integration health")) {
    failures.push("content missing primary SEO keyword");
  }

  if (!pageSource.includes("RestaurantIntegrationHealthLanding")) {
    failures.push("page missing RestaurantIntegrationHealthLanding component");
  }

  if (!contentSource.includes(RESTAURANT_INTEGRATION_HEALTH_LANDING_META.utmCampaign)) {
    failures.push("content missing utm campaign");
  }

  return { ok: failures.length === 0, failures };
}
