import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  APP_MARKETPLACE_DEVELOPERS_PAGE,
  APP_MARKETPLACE_EXTENSIONS_PAGE,
  APP_MARKETPLACE_PARTNER_APPS_CONFIG,
  APP_MARKETPLACE_THIRD_PARTY_COMPONENT_PATH,
  APP_MARKETPLACE_THIRD_PARTY_CONTENT_PATH,
  APP_MARKETPLACE_THIRD_PARTY_HONESTY_MARKERS,
  APP_MARKETPLACE_THIRD_PARTY_PAGE_PATH,
  APP_MARKETPLACE_THIRD_PARTY_REQUIRED_MARKERS,
  APP_MARKETPLACE_THIRD_PARTY_ROUTE,
  APP_MARKETPLACE_THIRD_PARTY_STRIP_PATH,
  APP_MARKETPLACE_THIRD_PARTY_WIRING_PATHS,
} from "@/lib/platform/app-marketplace-third-party-absolute-final-policy";

export type AppMarketplaceThirdPartyAudit = {
  ok: boolean;
  failures: string[];
};

export function auditAppMarketplaceThirdPartyWiring(
  root = process.cwd(),
): AppMarketplaceThirdPartyAudit {
  const failures: string[] = [];

  for (const rel of APP_MARKETPLACE_THIRD_PARTY_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const componentSource = readFileSync(
    join(root, APP_MARKETPLACE_THIRD_PARTY_COMPONENT_PATH),
    "utf8",
  );
  const contentSource = readFileSync(
    join(root, APP_MARKETPLACE_THIRD_PARTY_CONTENT_PATH),
    "utf8",
  );
  const pageSource = readFileSync(join(root, APP_MARKETPLACE_THIRD_PARTY_PAGE_PATH), "utf8");
  const stripSource = readFileSync(join(root, APP_MARKETPLACE_THIRD_PARTY_STRIP_PATH), "utf8");
  const extensionsPage = readFileSync(join(root, APP_MARKETPLACE_EXTENSIONS_PAGE), "utf8");
  const partnerConfig = readFileSync(join(root, APP_MARKETPLACE_PARTNER_APPS_CONFIG), "utf8");

  for (const marker of APP_MARKETPLACE_THIRD_PARTY_REQUIRED_MARKERS) {
    if (!componentSource.includes(marker)) {
      failures.push(`component missing marker: ${marker}`);
    }
  }

  for (const marker of APP_MARKETPLACE_THIRD_PARTY_HONESTY_MARKERS) {
    if (!componentSource.includes(marker) && !contentSource.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  if (!contentSource.includes(APP_MARKETPLACE_THIRD_PARTY_ROUTE)) {
    failures.push("content missing marketing route");
  }

  if (!pageSource.includes("AppMarketplaceThirdParty")) {
    failures.push("page missing AppMarketplaceThirdParty");
  }

  if (!extensionsPage.includes("AppMarketplaceThirdPartyStrip")) {
    failures.push("extensions page missing marketplace strip");
  }

  if (!stripSource.includes(APP_MARKETPLACE_THIRD_PARTY_ROUTE)) {
    failures.push("strip missing public marketplace route");
  }

  if (!contentSource.includes("app-marketplace-third-party-absolute-final-v1")) {
    failures.push("content missing policy id reference");
  }

  if (!partnerConfig.includes("partner-slack-ops-alerts")) {
    failures.push("partner-apps.json missing certified SI baseline");
  }

  if (existsSync(join(root, APP_MARKETPLACE_DEVELOPERS_PAGE))) {
    const devPage = readFileSync(join(root, APP_MARKETPLACE_DEVELOPERS_PAGE), "utf8");
    if (!devPage.includes("AppMarketplacePanel")) {
      failures.push("developers page missing AppMarketplacePanel");
    }
  }

  return { ok: failures.length === 0, failures };
}
