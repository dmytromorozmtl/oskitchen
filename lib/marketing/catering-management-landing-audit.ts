import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  CATERING_MANAGEMENT_HONESTY_MARKERS,
  CATERING_MANAGEMENT_ICP_DOC,
  CATERING_MANAGEMENT_LANDING_COMPONENT_PATH,
  CATERING_MANAGEMENT_LANDING_CONTENT_PATH,
  CATERING_MANAGEMENT_LANDING_PAGE_PATH,
  CATERING_MANAGEMENT_LANDING_ROUTE,
  CATERING_MANAGEMENT_PRIMARY_KEYWORD,
  CATERING_MANAGEMENT_REQUIRED_SECTIONS,
  CATERING_MANAGEMENT_WIRING_PATHS,
} from "@/lib/marketing/catering-management-landing-absolute-final-policy";

export type CateringManagementLandingAudit = {
  ok: boolean;
  failures: string[];
};

export function auditCateringManagementLandingWiring(
  root = process.cwd(),
): CateringManagementLandingAudit {
  const failures: string[] = [];

  for (const rel of CATERING_MANAGEMENT_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const componentSource = readFileSync(
    join(root, CATERING_MANAGEMENT_LANDING_COMPONENT_PATH),
    "utf8",
  );
  const contentSource = readFileSync(
    join(root, CATERING_MANAGEMENT_LANDING_CONTENT_PATH),
    "utf8",
  );
  const pageSource = readFileSync(join(root, CATERING_MANAGEMENT_LANDING_PAGE_PATH), "utf8");

  for (const section of CATERING_MANAGEMENT_REQUIRED_SECTIONS) {
    if (!componentSource.includes(section)) {
      failures.push(`landing component missing section marker: ${section}`);
    }
  }

  for (const marker of CATERING_MANAGEMENT_HONESTY_MARKERS) {
    if (!componentSource.includes(marker)) {
      failures.push(`landing component missing honesty marker: ${marker}`);
    }
  }

  if (!contentSource.includes(CATERING_MANAGEMENT_LANDING_ROUTE)) {
    failures.push("content missing landing route constant");
  }

  if (!contentSource.includes(CATERING_MANAGEMENT_PRIMARY_KEYWORD)) {
    failures.push("content missing primary SEO keyword");
  }

  if (!pageSource.includes("CateringManagementLanding")) {
    failures.push("page missing CateringManagementLanding component");
  }

  const icpDoc = readFileSync(join(root, CATERING_MANAGEMENT_ICP_DOC), "utf8");
  if (!icpDoc.includes(CATERING_MANAGEMENT_LANDING_ROUTE)) {
    failures.push("icp-definition-final.md missing link to /catering-management");
  }

  return { ok: failures.length === 0, failures };
}
