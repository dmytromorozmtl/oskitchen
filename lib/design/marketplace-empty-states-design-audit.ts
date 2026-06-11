import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MARKETPLACE_EMPTY_STATES_DESIGN_CORE_SCENARIOS,
  MARKETPLACE_EMPTY_STATES_DESIGN_CTA_TEST_ID,
  MARKETPLACE_EMPTY_STATES_DESIGN_ILLUSTRATION_MODULE,
  MARKETPLACE_EMPTY_STATES_DESIGN_ILLUSTRATION_TEST_ID,
  MARKETPLACE_EMPTY_STATES_DESIGN_POLICY_ID,
  MARKETPLACE_EMPTY_STATES_DESIGN_UI_MODULE,
  MARKETPLACE_EMPTY_STATES_DESIGN_VALUE_PROP_TEST_ID,
} from "@/lib/design/marketplace-empty-states-design-policy";
import { MARKETPLACE_EMPTY_STATE_WIRED_MODULES } from "@/lib/marketplace/marketplace-empty-states-policy";

export type MarketplaceEmptyStatesDesignAuditSummary = {
  policyId: typeof MARKETPLACE_EMPTY_STATES_DESIGN_POLICY_ID;
  uiModulePresent: boolean;
  illustrationModulePresent: boolean;
  illustrationWired: boolean;
  valuePropWired: boolean;
  ctaWired: boolean;
  coreScenariosIllustrated: boolean;
  passed: boolean;
};

export function auditMarketplaceEmptyStatesDesign(
  root = process.cwd(),
): MarketplaceEmptyStatesDesignAuditSummary {
  const uiPath = join(root, MARKETPLACE_EMPTY_STATES_DESIGN_UI_MODULE);
  const illustrationPath = join(root, MARKETPLACE_EMPTY_STATES_DESIGN_ILLUSTRATION_MODULE);

  const uiModulePresent = existsSync(uiPath);
  const illustrationModulePresent = existsSync(illustrationPath);

  let illustrationWired = false;
  let valuePropWired = false;
  let ctaWired = false;
  let coreScenariosIllustrated = false;

  if (illustrationModulePresent) {
    const source = readFileSync(illustrationPath, "utf8");
    illustrationWired =
      source.includes("MarketplaceEmptyStateIllustration") &&
      source.includes("IllustrationSvg");
  }

  if (uiModulePresent) {
    const source = readFileSync(uiPath, "utf8");
    illustrationWired =
      illustrationWired &&
      source.includes("MarketplaceEmptyStateIllustration") &&
      source.includes("MARKETPLACE_EMPTY_STATES_DESIGN_ILLUSTRATION_TEST_ID");
    valuePropWired =
      source.includes("MARKETPLACE_EMPTY_STATES_DESIGN_VALUE_PROP_TEST_ID") &&
      source.includes("MARKETPLACE_EMPTY_STATE_VALUE_PROP_LIST_CLASS");
    ctaWired =
      source.includes("MARKETPLACE_EMPTY_STATES_DESIGN_CTA_TEST_ID") &&
      source.includes("MARKETPLACE_EMPTY_STATE_CTA_ROW_CLASS");
  }

  const wiredModules = MARKETPLACE_EMPTY_STATE_WIRED_MODULES.filter((module) =>
    module.includes("catalog") ||
    module.includes("orders") ||
    module.includes("checkout") ||
    module.includes("vendors"),
  );
  coreScenariosIllustrated =
    MARKETPLACE_EMPTY_STATES_DESIGN_CORE_SCENARIOS.every((scenario) =>
      wiredModules.some((module) => {
        const path = join(root, module);
        if (!existsSync(path)) return false;
        const source = readFileSync(path, "utf8");
        return source.includes(`"${scenario}"`) || source.includes(`scenario="${scenario}"`);
      }),
    );

  const passed =
    uiModulePresent &&
    illustrationModulePresent &&
    illustrationWired &&
    valuePropWired &&
    ctaWired &&
    coreScenariosIllustrated &&
    MARKETPLACE_EMPTY_STATES_DESIGN_CORE_SCENARIOS.length === 4;

  return {
    policyId: MARKETPLACE_EMPTY_STATES_DESIGN_POLICY_ID,
    uiModulePresent,
    illustrationModulePresent,
    illustrationWired,
    valuePropWired,
    ctaWired,
    coreScenariosIllustrated,
    passed,
  };
}

export function formatMarketplaceEmptyStatesDesignAuditLines(
  summary: MarketplaceEmptyStatesDesignAuditSummary,
): string[] {
  return [
    `Marketplace empty states design audit (${summary.policyId})`,
    `UI module: ${summary.uiModulePresent ? "present" : "missing"} (${MARKETPLACE_EMPTY_STATES_DESIGN_UI_MODULE})`,
    `Illustration module: ${summary.illustrationModulePresent ? "present" : "missing"} (${MARKETPLACE_EMPTY_STATES_DESIGN_ILLUSTRATION_MODULE})`,
    `Illustration (${MARKETPLACE_EMPTY_STATES_DESIGN_ILLUSTRATION_TEST_ID}): ${summary.illustrationWired ? "yes" : "no"}`,
    `Value props (${MARKETPLACE_EMPTY_STATES_DESIGN_VALUE_PROP_TEST_ID}): ${summary.valuePropWired ? "yes" : "no"}`,
    `CTA row (${MARKETPLACE_EMPTY_STATES_DESIGN_CTA_TEST_ID}): ${summary.ctaWired ? "yes" : "no"}`,
    `Core scenarios (vendors/orders/catalog/cart): ${summary.coreScenariosIllustrated ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
