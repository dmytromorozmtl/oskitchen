import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

import {
  SETTINGS_SECTIONS,
  resolveSettingsSectionForPathname,
  type SettingsSection,
} from "@/lib/settings/section-registry";

/**
 * DES-13 — settings section registry audit and pathname resolution.
 */

export const SETTINGS_SECTION_REGISTRY_POLICY_ID = "settings-section-registry-des13-v1" as const;

/** Settings page routes from app/dashboard/settings. */
export function listSettingsPageRoutes(appRoot = join(process.cwd(), "app")): string[] {
  const settingsRoot = join(appRoot, "dashboard/settings");
  const pages: string[] = [];

  function walk(dir: string): void {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) {
        walk(path);
        continue;
      }
      if (name === "page.tsx") pages.push(path);
    }
  }

  walk(settingsRoot);

  return pages
    .map((file) => {
      const seg = relative(appRoot, file).replace(/\\/g, "/").replace(/\/page\.tsx$/, "");
      return `/${seg}`;
    })
    .sort();
}

export type SettingsRegistryGap = {
  route: string;
  reason: string;
};

export function isSettingsRouteCoveredByRegistry(route: string): boolean {
  return resolveSettingsSectionForPathname(route) !== null;
}

export function findSettingsRegistryCoverageGaps(
  routes = listSettingsPageRoutes(),
): SettingsRegistryGap[] {
  const gaps: SettingsRegistryGap[] = [];
  for (const route of routes) {
    if (isSettingsRouteCoveredByRegistry(route)) continue;
    gaps.push({
      route,
      reason: "No matching SETTINGS_SECTIONS href or prefix",
    });
  }
  return gaps;
}

export type SettingsRegistryAudit = {
  policyId: typeof SETTINGS_SECTION_REGISTRY_POLICY_ID;
  sectionCount: number;
  routeCount: number;
  coveredRouteCount: number;
  gaps: SettingsRegistryGap[];
  passed: boolean;
};

export function auditSettingsSectionRegistry(
  routes = listSettingsPageRoutes(),
): SettingsRegistryAudit {
  const gaps = findSettingsRegistryCoverageGaps(routes);
  const coveredRouteCount = routes.length - gaps.length;
  return {
    policyId: SETTINGS_SECTION_REGISTRY_POLICY_ID,
    sectionCount: SETTINGS_SECTIONS.length,
    routeCount: routes.length,
    coveredRouteCount,
    gaps,
    passed: gaps.length === 0,
  };
}

export { getSettingsSectionByHref, resolveSettingsSectionForPathname } from "@/lib/settings/section-registry";

export function settingsSectionsForCommandPalette(
  sections: readonly SettingsSection[] = SETTINGS_SECTIONS,
): { href: string; label: string; k: string }[] {
  return sections
    .filter((section) => section.key !== "overview")
    .map((section) => ({
      href: section.href,
      label: section.label,
      k: `settings-${section.key}`,
    }));
}
