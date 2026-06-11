/**
 * Blueprint P1-82 — Sales assets package (10 core GTM artifacts).
 *
 * @see docs/sales-assets-package.md
 */

export const SALES_ASSETS_PACKAGE_POLICY_ID = "sales-assets-package-p1-82-v1" as const;

export const SALES_ASSETS_PACKAGE_DOC = "docs/sales-assets-package.md" as const;

export const SALES_ASSETS_PACKAGE_AUDIT_SCRIPT =
  "scripts/audit-sales-assets-package.ts" as const;

export const SALES_ASSETS_PACKAGE_NPM_SCRIPT = "audit:sales-assets-package" as const;

export const SALES_ASSETS_PACKAGE_UNIT_TEST =
  "tests/unit/sales-assets-package.test.ts" as const;

export const SALES_ASSETS_PACKAGE_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const SALES_ASSETS_PACKAGE_ASSET_COUNT = 10 as const;

export type SalesAssetId =
  | "pitch_deck"
  | "battle_cards"
  | "roi_calculator"
  | "loi"
  | "demo_script"
  | "pricing_sheet"
  | "security_one_pager"
  | "integration_list"
  | "implementation_checklist"
  | "case_study_template";

export type SalesAssetEntry = {
  id: SalesAssetId;
  label: string;
  docPath: string;
  companionPaths?: readonly string[];
};

export const SALES_ASSETS_PACKAGE_ENTRIES: readonly SalesAssetEntry[] = [
  {
    id: "pitch_deck",
    label: "Pitch deck",
    docPath: "docs/sales-deck.md",
    companionPaths: ["app/deck/page.tsx"],
  },
  {
    id: "battle_cards",
    label: "Battle cards",
    docPath: "docs/competitive-battle-cards.md",
  },
  {
    id: "roi_calculator",
    label: "ROI calculator",
    docPath: "docs/roi-calculator-conservative.md",
    companionPaths: [
      "components/marketing/roi-calculator.tsx",
      "app/roi-calculator/page.tsx",
    ],
  },
  {
    id: "loi",
    label: "LOI template",
    docPath: "docs/loi-design-partner-template.md",
    companionPaths: ["docs/loi-template-walkthrough.md"],
  },
  {
    id: "demo_script",
    label: "Demo script",
    docPath: "docs/DEMO_CALL_SCRIPT.md",
    companionPaths: ["docs/demo-script-15min.md"],
  },
  {
    id: "pricing_sheet",
    label: "Pricing sheet",
    docPath: "docs/transparent-pricing-sales-guide.md",
    companionPaths: ["components/marketing/pricing-page.tsx"],
  },
  {
    id: "security_one_pager",
    label: "Security one-pager",
    docPath: "docs/security-one-pager-sales.md",
    companionPaths: ["docs/sales-safe-claims-registry.md"],
  },
  {
    id: "integration_list",
    label: "Integration list",
    docPath: "docs/integration-list-sales.md",
    companionPaths: ["lib/integrations/integration-registry.ts"],
  },
  {
    id: "implementation_checklist",
    label: "Implementation checklist",
    docPath: "docs/IMPLEMENTATION_CHECKLIST_TEMPLATES.md",
    companionPaths: ["lib/implementation/implementation-checklists.ts"],
  },
  {
    id: "case_study_template",
    label: "Case study template",
    docPath: "docs/case-study-template-pre-pilot.md",
    companionPaths: ["docs/case-studies/_PRE_PILOT_TEMPLATE.md"],
  },
] as const;

export const SALES_ASSETS_PACKAGE_HONESTY_MARKERS = [
  "BETA",
  "verify",
  "honest",
  "typical",
  "SOC 2",
] as const;

export const SALES_ASSETS_PACKAGE_WIRING_PATHS = [
  SALES_ASSETS_PACKAGE_DOC,
  "lib/marketing/sales-assets-package-policy.ts",
  "lib/marketing/sales-assets-package-audit.ts",
  SALES_ASSETS_PACKAGE_UNIT_TEST,
  ...SALES_ASSETS_PACKAGE_ENTRIES.flatMap((entry) => [
    entry.docPath,
    ...(entry.companionPaths ?? []),
  ]),
] as const;
