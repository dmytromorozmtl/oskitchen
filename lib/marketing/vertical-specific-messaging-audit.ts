import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  VERTICAL_SPECIFIC_MESSAGING_COMPONENT_PATH,
  VERTICAL_SPECIFIC_MESSAGING_CONTENT_PATH,
  VERTICAL_SPECIFIC_MESSAGING_HONESTY_MARKERS,
  VERTICAL_SPECIFIC_MESSAGING_ICP_DOC,
  VERTICAL_SPECIFIC_MESSAGING_PRIMARY_HEADLINE,
  VERTICAL_SPECIFIC_MESSAGING_REQUIRED_SECTIONS,
  VERTICAL_SPECIFIC_MESSAGING_SOLUTIONS_HUB,
  VERTICAL_SPECIFIC_MESSAGING_SOLUTIONS_PAGE,
  VERTICAL_SPECIFIC_MESSAGING_WIRING_PATHS,
} from "@/lib/marketing/vertical-specific-messaging-absolute-final-policy";

export type VerticalSpecificMessagingAudit = {
  ok: boolean;
  failures: string[];
};

export function auditVerticalSpecificMessagingWiring(
  root = process.cwd(),
): VerticalSpecificMessagingAudit {
  const failures: string[] = [];

  for (const rel of VERTICAL_SPECIFIC_MESSAGING_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const componentSource = readFileSync(
    join(root, VERTICAL_SPECIFIC_MESSAGING_COMPONENT_PATH),
    "utf8",
  );
  const contentSource = readFileSync(
    join(root, VERTICAL_SPECIFIC_MESSAGING_CONTENT_PATH),
    "utf8",
  );
  const solutionsPageSource = readFileSync(
    join(root, VERTICAL_SPECIFIC_MESSAGING_SOLUTIONS_PAGE),
    "utf8",
  );
  const solutionsHubSource = readFileSync(
    join(root, VERTICAL_SPECIFIC_MESSAGING_SOLUTIONS_HUB),
    "utf8",
  );

  for (const section of VERTICAL_SPECIFIC_MESSAGING_REQUIRED_SECTIONS) {
    if (!componentSource.includes(section)) {
      failures.push(`component missing section marker: ${section}`);
    }
  }

  for (const marker of VERTICAL_SPECIFIC_MESSAGING_HONESTY_MARKERS) {
    if (!componentSource.includes(marker) && !contentSource.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  if (!contentSource.includes(VERTICAL_SPECIFIC_MESSAGING_PRIMARY_HEADLINE)) {
    failures.push("content missing primary headline");
  }

  if (!solutionsPageSource.includes("VerticalSpecificMessagingSection")) {
    failures.push("solutions page missing VerticalSpecificMessagingSection");
  }

  if (!solutionsHubSource.includes(VERTICAL_SPECIFIC_MESSAGING_PRIMARY_HEADLINE)) {
    failures.push("solutions hub copy missing primary headline");
  }

  const icpDoc = readFileSync(join(root, VERTICAL_SPECIFIC_MESSAGING_ICP_DOC), "utf8");
  if (!icpDoc.includes("multi-concept")) {
    failures.push("icp-definition-final.md missing multi-concept reference");
  }

  return { ok: failures.length === 0, failures };
}
