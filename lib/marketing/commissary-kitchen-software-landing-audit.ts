import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  COMMISSARY_KITCHEN_SOFTWARE_HONESTY_MARKERS,
  COMMISSARY_KITCHEN_SOFTWARE_ICP_DOC,
  COMMISSARY_KITCHEN_SOFTWARE_LANDING_ABSOLUTE_FINAL_POLICY_ID,
  COMMISSARY_KITCHEN_SOFTWARE_LANDING_COMPONENT_PATH,
  COMMISSARY_KITCHEN_SOFTWARE_LANDING_CONTENT_PATH,
  COMMISSARY_KITCHEN_SOFTWARE_LANDING_PAGE_PATH,
  COMMISSARY_KITCHEN_SOFTWARE_LANDING_ROUTE,
  COMMISSARY_KITCHEN_SOFTWARE_PRIMARY_KEYWORD,
  COMMISSARY_KITCHEN_SOFTWARE_REQUIRED_SECTIONS,
  COMMISSARY_KITCHEN_SOFTWARE_WIRING_PATHS,
} from "@/lib/marketing/commissary-kitchen-software-landing-absolute-final-policy";

export type CommissaryKitchenSoftwareLandingAudit = {
  ok: boolean;
  failures: string[];
};

export function auditCommissaryKitchenSoftwareLandingWiring(
  root = process.cwd(),
): CommissaryKitchenSoftwareLandingAudit {
  const failures: string[] = [];

  for (const rel of COMMISSARY_KITCHEN_SOFTWARE_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const componentSource = readFileSync(
    join(root, COMMISSARY_KITCHEN_SOFTWARE_LANDING_COMPONENT_PATH),
    "utf8",
  );
  const contentSource = readFileSync(
    join(root, COMMISSARY_KITCHEN_SOFTWARE_LANDING_CONTENT_PATH),
    "utf8",
  );
  const pageSource = readFileSync(join(root, COMMISSARY_KITCHEN_SOFTWARE_LANDING_PAGE_PATH), "utf8");

  for (const section of COMMISSARY_KITCHEN_SOFTWARE_REQUIRED_SECTIONS) {
    if (!componentSource.includes(section)) {
      failures.push(`landing component missing section marker: ${section}`);
    }
  }

  for (const marker of COMMISSARY_KITCHEN_SOFTWARE_HONESTY_MARKERS) {
    if (!componentSource.includes(marker)) {
      failures.push(`landing component missing honesty marker: ${marker}`);
    }
  }

  if (!contentSource.includes(COMMISSARY_KITCHEN_SOFTWARE_LANDING_ROUTE)) {
    failures.push("content missing landing route constant");
  }

  if (!contentSource.includes(COMMISSARY_KITCHEN_SOFTWARE_PRIMARY_KEYWORD)) {
    failures.push("content missing primary SEO keyword");
  }

  if (!pageSource.includes("CommissaryKitchenSoftwareLanding")) {
    failures.push("page missing CommissaryKitchenSoftwareLanding component");
  }

  const icpDoc = readFileSync(join(root, COMMISSARY_KITCHEN_SOFTWARE_ICP_DOC), "utf8");
  if (!icpDoc.includes(COMMISSARY_KITCHEN_SOFTWARE_LANDING_ROUTE)) {
    failures.push(`icp-definition-final.md missing link to ${COMMISSARY_KITCHEN_SOFTWARE_LANDING_ROUTE}`);
  }

  return { ok: failures.length === 0, failures };
}
