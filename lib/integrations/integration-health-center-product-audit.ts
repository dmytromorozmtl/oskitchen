import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  INTEGRATION_HEALTH_CENTER_DASHBOARD_ROUTE,
  INTEGRATION_HEALTH_CENTER_PRODUCT_FEATURE_MODULES,
  INTEGRATION_HEALTH_CENTER_PRODUCT_HONESTY_MARKERS,
  INTEGRATION_HEALTH_CENTER_PRODUCT_ROUTE,
  INTEGRATION_HEALTH_CENTER_PRODUCT_WIRING_PATHS,
} from "@/lib/integrations/integration-health-center-product-absolute-final-policy";
import { INTEGRATION_HEALTH_CENTER_PRODUCT_FEATURES } from "@/lib/integrations/integration-health-center-product-content";

export type IntegrationHealthCenterProductAudit = {
  ok: boolean;
  failures: string[];
  featureCount: number;
};

export function auditIntegrationHealthCenterProductWiring(
  root = process.cwd(),
): IntegrationHealthCenterProductAudit {
  const failures: string[] = [];

  for (const rel of INTEGRATION_HEALTH_CENTER_PRODUCT_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const pageSource = readFileSync(
    join(root, "app/product/integration-health-center/page.tsx"),
    "utf8",
  );
  const componentSource = readFileSync(
    join(root, "components/product/integration-health-center-product-page.tsx"),
    "utf8",
  );
  const dashboardSource = readFileSync(
    join(root, "app/dashboard/integration-health/page.tsx"),
    "utf8",
  );
  const productIndexSource = readFileSync(join(root, "app/product/page.tsx"), "utf8");

  if (!pageSource.includes("IntegrationHealthCenterProductPage")) {
    failures.push("product page missing IntegrationHealthCenterProductPage");
  }
  if (!componentSource.includes("INTEGRATION_HEALTH_CENTER_PRODUCT_ABSOLUTE_FINAL_POLICY_ID")) {
    failures.push("product component missing policy id import");
  }
  if (!componentSource.includes("ihc-product-feature-")) {
    failures.push("product component missing feature test ids");
  }

  const contentSource = readFileSync(
    join(root, "lib/integrations/integration-health-center-product-content.ts"),
    "utf8",
  );
  for (const feature of INTEGRATION_HEALTH_CENTER_PRODUCT_FEATURES) {
    if (!contentSource.includes(`id: "${feature.id}"`)) {
      failures.push(`product content missing feature id: ${feature.id}`);
    }
  }

  for (const marker of INTEGRATION_HEALTH_CENTER_PRODUCT_HONESTY_MARKERS) {
    if (!componentSource.includes(marker)) {
      failures.push(`product component missing honesty marker: ${marker}`);
    }
  }

  if (!dashboardSource.includes(INTEGRATION_HEALTH_CENTER_PRODUCT_ROUTE)) {
    failures.push("dashboard integration-health page missing product page link");
  }

  if (!productIndexSource.includes(INTEGRATION_HEALTH_CENTER_PRODUCT_ROUTE)) {
    failures.push("product index missing Integration Health Center card");
  }

  if (INTEGRATION_HEALTH_CENTER_PRODUCT_FEATURES.length !== INTEGRATION_HEALTH_CENTER_PRODUCT_FEATURE_MODULES.length) {
    failures.push("feature module count mismatch");
  }

  return {
    ok: failures.length === 0,
    failures,
    featureCount: INTEGRATION_HEALTH_CENTER_PRODUCT_FEATURES.length,
  };
}
