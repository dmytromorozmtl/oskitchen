import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  WHITE_LABEL_STOREFRONT_DEPTH_CHOWNOW_PARITY_PILLARS,
  WHITE_LABEL_STOREFRONT_DEPTH_COMPONENT_PATH,
  WHITE_LABEL_STOREFRONT_DEPTH_CONTENT_PATH,
  WHITE_LABEL_STOREFRONT_DEPTH_HONESTY_MARKERS,
  WHITE_LABEL_STOREFRONT_DEPTH_PAGE_PATH,
  WHITE_LABEL_STOREFRONT_DEPTH_REQUIRED_MARKERS,
  WHITE_LABEL_STOREFRONT_DEPTH_ROUTE,
  WHITE_LABEL_STOREFRONT_DEPTH_SERVICE_PATH,
  WHITE_LABEL_STOREFRONT_DEPTH_SETTINGS_PAGE,
  WHITE_LABEL_STOREFRONT_DEPTH_STRIP_PATH,
  WHITE_LABEL_STOREFRONT_DEPTH_WIRING_PATHS,
} from "@/lib/storefront/white-label-storefront-depth-absolute-final-policy";

export type WhiteLabelStorefrontDepthAudit = {
  ok: boolean;
  failures: string[];
};

export function auditWhiteLabelStorefrontDepthWiring(
  root = process.cwd(),
): WhiteLabelStorefrontDepthAudit {
  const failures: string[] = [];

  for (const rel of WHITE_LABEL_STOREFRONT_DEPTH_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const componentSource = readFileSync(join(root, WHITE_LABEL_STOREFRONT_DEPTH_COMPONENT_PATH), "utf8");
  const pageSource = readFileSync(join(root, WHITE_LABEL_STOREFRONT_DEPTH_PAGE_PATH), "utf8");
  const serviceSource = readFileSync(join(root, WHITE_LABEL_STOREFRONT_DEPTH_SERVICE_PATH), "utf8");
  const contentSource = readFileSync(join(root, WHITE_LABEL_STOREFRONT_DEPTH_CONTENT_PATH), "utf8");
  const stripSource = readFileSync(join(root, WHITE_LABEL_STOREFRONT_DEPTH_STRIP_PATH), "utf8");
  const settingsPage = readFileSync(join(root, WHITE_LABEL_STOREFRONT_DEPTH_SETTINGS_PAGE), "utf8");
  const themePage = readFileSync(join(root, "app/dashboard/storefront/theme/page.tsx"), "utf8");

  for (const marker of WHITE_LABEL_STOREFRONT_DEPTH_REQUIRED_MARKERS) {
    if (!componentSource.includes(marker)) {
      failures.push(`component missing marker: ${marker}`);
    }
  }

  for (const marker of WHITE_LABEL_STOREFRONT_DEPTH_HONESTY_MARKERS) {
    if (!componentSource.includes(marker) && !pageSource.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  if (!pageSource.includes("WhiteLabelStorefrontDepthPanel")) {
    failures.push("page missing WhiteLabelStorefrontDepthPanel");
  }

  if (!pageSource.includes("loadWhiteLabelStorefrontDepthModel")) {
    failures.push("page missing loadWhiteLabelStorefrontDepthModel");
  }

  if (!serviceSource.includes("WHITE_LABEL_STOREFRONT_DEPTH_BASE_CAPABILITIES")) {
    failures.push("service missing base capabilities import");
  }

  for (const pillar of WHITE_LABEL_STOREFRONT_DEPTH_CHOWNOW_PARITY_PILLARS) {
    if (!contentSource.includes(pillar)) {
      failures.push(`content missing pillar: ${pillar}`);
    }
  }

  if (
    !stripSource.includes(WHITE_LABEL_STOREFRONT_DEPTH_ROUTE) &&
    !stripSource.includes("WHITE_LABEL_STOREFRONT_DEPTH_ROUTE")
  ) {
    failures.push("strip missing depth route");
  }

  if (
    !settingsPage.includes(WHITE_LABEL_STOREFRONT_DEPTH_ROUTE) &&
    !settingsPage.includes("WHITE_LABEL_STOREFRONT_DEPTH_ROUTE")
  ) {
    failures.push("settings white-label page missing depth route link");
  }

  if (!themePage.includes("WhiteLabelStorefrontDepthStrip")) {
    failures.push("storefront theme page missing depth strip");
  }

  if (!componentSource.includes("white-label-storefront-depth-absolute-final-v1")) {
    failures.push("component missing policy id reference");
  }

  return { ok: failures.length === 0, failures };
}
