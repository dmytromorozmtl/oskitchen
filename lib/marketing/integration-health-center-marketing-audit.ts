import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  INTEGRATION_HEALTH_CENTER_MARKETING_COMPONENT_PATH,
  INTEGRATION_HEALTH_CENTER_MARKETING_CONTENT_PATH,
  INTEGRATION_HEALTH_CENTER_MARKETING_HONESTY_MARKERS,
  INTEGRATION_HEALTH_CENTER_MARKETING_MOAT_COMPONENT,
  INTEGRATION_HEALTH_CENTER_MARKETING_PAGE_PATH,
  INTEGRATION_HEALTH_CENTER_MARKETING_ROUTE,
  INTEGRATION_HEALTH_CENTER_MARKETING_REQUIRED_SECTIONS,
  INTEGRATION_HEALTH_CENTER_MARKETING_SALES_DOC,
  INTEGRATION_HEALTH_CENTER_MARKETING_SALES_HOOK,
  INTEGRATION_HEALTH_CENTER_MARKETING_WIRING_PATHS,
  INTEGRATION_HEALTH_CENTER_PRODUCT_ROUTE,
} from "@/lib/marketing/integration-health-center-marketing-absolute-final-policy";

export type IntegrationHealthCenterMarketingAudit = {
  ok: boolean;
  failures: string[];
};

export function auditIntegrationHealthCenterMarketingWiring(
  root = process.cwd(),
): IntegrationHealthCenterMarketingAudit {
  const failures: string[] = [];

  for (const rel of INTEGRATION_HEALTH_CENTER_MARKETING_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const componentSource = readFileSync(
    join(root, INTEGRATION_HEALTH_CENTER_MARKETING_COMPONENT_PATH),
    "utf8",
  );
  const contentSource = readFileSync(
    join(root, INTEGRATION_HEALTH_CENTER_MARKETING_CONTENT_PATH),
    "utf8",
  );
  const pageSource = readFileSync(
    join(root, INTEGRATION_HEALTH_CENTER_MARKETING_PAGE_PATH),
    "utf8",
  );
  const moatSource = readFileSync(
    join(root, INTEGRATION_HEALTH_CENTER_MARKETING_MOAT_COMPONENT),
    "utf8",
  );
  const productPageSource = readFileSync(
    join(root, "app/product/integration-health-center/page.tsx"),
    "utf8",
  );
  const salesDoc = readFileSync(join(root, INTEGRATION_HEALTH_CENTER_MARKETING_SALES_DOC), "utf8");

  for (const section of INTEGRATION_HEALTH_CENTER_MARKETING_REQUIRED_SECTIONS) {
    if (!componentSource.includes(section) && !pageSource.includes(section)) {
      failures.push(`missing section marker: ${section}`);
    }
  }

  for (const marker of INTEGRATION_HEALTH_CENTER_MARKETING_HONESTY_MARKERS) {
    if (!componentSource.includes(marker) && !contentSource.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  if (!contentSource.includes(INTEGRATION_HEALTH_CENTER_MARKETING_ROUTE)) {
    failures.push("content missing marketing route constant");
  }

  if (
    !contentSource.includes(INTEGRATION_HEALTH_CENTER_MARKETING_SALES_HOOK) &&
    !componentSource.includes(INTEGRATION_HEALTH_CENTER_MARKETING_SALES_HOOK)
  ) {
    failures.push("missing P1-24 DoorDash sales hook in content or landing");
  }

  if (!salesDoc.includes(INTEGRATION_HEALTH_CENTER_MARKETING_SALES_HOOK)) {
    failures.push("sales deck missing DoorDash sales hook");
  }

  if (!moatSource.includes(INTEGRATION_HEALTH_CENTER_MARKETING_ROUTE)) {
    failures.push("home moat component missing link to marketing page");
  }

  if (!productPageSource.includes(INTEGRATION_HEALTH_CENTER_MARKETING_ROUTE)) {
    failures.push("product page missing cross-link to marketing page");
  }

  if (
    !salesDoc.includes(INTEGRATION_HEALTH_CENTER_MARKETING_ROUTE) &&
    !salesDoc.includes(INTEGRATION_HEALTH_CENTER_PRODUCT_ROUTE)
  ) {
    failures.push("sales deck missing integration health center route reference");
  }

  return { ok: failures.length === 0, failures };
}
