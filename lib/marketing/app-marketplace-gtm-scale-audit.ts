import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { componentUsesPmGtmTokens } from "@/lib/marketing/absolute-final-pm-marketing-full-scale-tokens";
import {
  APP_MARKETPLACE_GTM_SCALE_COMPONENT_PATH,
  APP_MARKETPLACE_GTM_SCALE_CONTENT_PATH,
  APP_MARKETPLACE_GTM_SCALE_HONESTY_MARKERS,
  APP_MARKETPLACE_GTM_SCALE_WIRING_PATHS,
} from "@/lib/marketing/app-marketplace-gtm-scale-absolute-final-policy";
import {
  APP_MARKETPLACE_THIRD_PARTY_ROUTE,
  APP_MARKETPLACE_THIRD_PARTY_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/platform/app-marketplace-third-party-absolute-final-policy";

export type AppMarketplaceGtmScaleAudit = {
  ok: boolean;
  failures: string[];
};

export function auditAppMarketplaceGtmScaleWiring(
  root = process.cwd(),
): AppMarketplaceGtmScaleAudit {
  const failures: string[] = [];

  for (const rel of APP_MARKETPLACE_GTM_SCALE_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const componentSource = readFileSync(join(root, APP_MARKETPLACE_GTM_SCALE_COMPONENT_PATH), "utf8");
  const contentSource = readFileSync(join(root, APP_MARKETPLACE_GTM_SCALE_CONTENT_PATH), "utf8");
  const combined = `${componentSource}\n${contentSource}`;

  for (const marker of APP_MARKETPLACE_GTM_SCALE_HONESTY_MARKERS) {
    if (!combined.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  if (!componentUsesPmGtmTokens(componentSource)) {
    failures.push("component missing pm-gtm token wiring");
  }

  if (!combined.includes(APP_MARKETPLACE_THIRD_PARTY_ROUTE)) {
    failures.push("missing /app-marketplace route reference");
  }

  if (!combined.includes(APP_MARKETPLACE_THIRD_PARTY_ABSOLUTE_FINAL_POLICY_ID)) {
    failures.push("missing feature policy id reference");
  }

  if (!combined.includes("app-marketplace-gtm-scale-absolute-final-v1")) {
    failures.push("missing GTM policy id reference");
  }

  return { ok: failures.length === 0, failures };
}
