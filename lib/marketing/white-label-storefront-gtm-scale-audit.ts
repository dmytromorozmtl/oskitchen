import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  WHITE_LABEL_STOREFRONT_DEPTH_ABSOLUTE_FINAL_POLICY_ID,
  WHITE_LABEL_STOREFRONT_DEPTH_COMPONENT_PATH,
  WHITE_LABEL_STOREFRONT_DEPTH_ROUTE,
  WHITE_LABEL_STOREFRONT_DEPTH_SETTINGS_PAGE,
} from "@/lib/storefront/white-label-storefront-depth-absolute-final-policy";
import {
  WHITE_LABEL_STOREFRONT_GTM_SCALE_DOC_PATH,
  WHITE_LABEL_STOREFRONT_GTM_SCALE_HONESTY_MARKERS,
  WHITE_LABEL_STOREFRONT_GTM_SCALE_WIRING_PATHS,
} from "@/lib/marketing/white-label-storefront-gtm-scale-absolute-final-policy";

export type WhiteLabelStorefrontGtmScaleAudit = {
  ok: boolean;
  failures: string[];
};

export function auditWhiteLabelStorefrontGtmScaleWiring(
  root = process.cwd(),
): WhiteLabelStorefrontGtmScaleAudit {
  const failures: string[] = [];

  for (const rel of WHITE_LABEL_STOREFRONT_GTM_SCALE_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const docSource = readFileSync(join(root, WHITE_LABEL_STOREFRONT_GTM_SCALE_DOC_PATH), "utf8");
  const componentSource = readFileSync(join(root, WHITE_LABEL_STOREFRONT_DEPTH_COMPONENT_PATH), "utf8");

  for (const marker of WHITE_LABEL_STOREFRONT_GTM_SCALE_HONESTY_MARKERS) {
    if (!docSource.includes(marker)) {
      failures.push(`doc missing honesty marker: ${marker}`);
    }
  }

  if (!docSource.includes(WHITE_LABEL_STOREFRONT_DEPTH_COMPONENT_PATH)) {
    failures.push("doc missing feature component path");
  }

  if (!docSource.includes(WHITE_LABEL_STOREFRONT_DEPTH_ROUTE)) {
    failures.push("doc missing white-label storefront route");
  }

  if (!docSource.includes("/dashboard/settings/white-label")) {
    failures.push("doc missing settings white-label cross-link");
  }

  if (
    !componentSource.includes("white-label-storefront-depth-absolute-final-v1") &&
    !componentSource.includes(WHITE_LABEL_STOREFRONT_DEPTH_ABSOLUTE_FINAL_POLICY_ID)
  ) {
    failures.push("component missing feature policy id");
  }

  if (!docSource.includes("white-label-storefront-gtm-scale-absolute-final-v1")) {
    failures.push("doc missing GTM policy id reference");
  }

  return { ok: failures.length === 0, failures };
}
