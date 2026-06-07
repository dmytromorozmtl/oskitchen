/**
 * Absolute Final Task 64 — design system documentation (components, tokens, patterns).
 *
 * Extends DES-39 canonical doc with Task 56–63 operator surfaces.
 *
 * @see docs/design-system.md
 * @see lib/design/design-system-doc-policy.ts
 */

import { DESIGN_SYSTEM_DOC_POLICY_ID } from "@/lib/design/design-system-doc-policy";

export const DESIGN_SYSTEM_DOCUMENTATION_ABSOLUTE_FINAL_POLICY_ID =
  "design-system-documentation-absolute-final-v1" as const;

export const DESIGN_SYSTEM_DOCUMENTATION_UPSTREAM_POLICY_ID = DESIGN_SYSTEM_DOC_POLICY_ID;

export const DESIGN_SYSTEM_DOCUMENTATION_DOC_PATH = "docs/design-system.md" as const;

export const DESIGN_SYSTEM_TOP_20_COMPONENTS = [
  { id: "button", path: "components/ui/button.tsx", use: "Primary, outline, ghost, destructive actions" },
  { id: "card", path: "components/ui/card.tsx", use: "Explainable ops blocks with CardHeader + CardDescription" },
  { id: "badge", path: "components/ui/badge.tsx", use: "Status chips, demo labels, environment tags" },
  { id: "empty-state", path: "components/ui/empty-state.tsx", use: "Zero-data surfaces with CTA" },
  { id: "error-state", path: "components/feedback/error-state.tsx", use: "Route error boundaries + retry" },
  { id: "skeleton", path: "components/ui/skeleton.tsx", use: "Low-level pulse primitive" },
  { id: "input", path: "components/ui/input.tsx", use: "Form fields, search, POS barcode" },
  { id: "select", path: "components/ui/select.tsx", use: "Compact filters and settings" },
  { id: "dialog", path: "components/ui/dialog.tsx", use: "Modal confirmations and wizards" },
  { id: "sheet", path: "components/ui/sheet.tsx", use: "Mobile nav drawer, side panels" },
  { id: "tabs", path: "components/ui/tabs.tsx", use: "Section switching without route churn" },
  { id: "table", path: "components/ui/table.tsx", use: "Dense ops lists (orders, inventory)" },
  { id: "tooltip", path: "components/ui/tooltip.tsx", use: "Icon-only control hints" },
  { id: "switch", path: "components/ui/switch.tsx", use: "Boolean settings toggles" },
  { id: "progress", path: "components/ui/progress.tsx", use: "Setup wizards, sync progress" },
  { id: "alert-dialog", path: "components/ui/alert-dialog.tsx", use: "Irreversible confirm flows" },
  { id: "dropdown-menu", path: "components/ui/dropdown-menu.tsx", use: "Account menu, row actions" },
  { id: "page-header", path: "components/layout/page-header.tsx", use: "Dashboard title + actions row" },
  { id: "permission-denied", path: "components/ui/permission-denied-card.tsx", use: "RBAC denial with guidance" },
  { id: "theme-toggle", path: "components/theme-toggle.tsx", use: "Light / dark / system preference" },
] as const;

export const DESIGN_SYSTEM_DOCUMENTATION_SECTION_ANCHORS = [
  "## Component catalog (top 20)",
  "## Data visualization",
  "## Enterprise and labor surfaces",
  "## Offline resilience UI",
  "## Absolute Final extensions (Tasks 56–63)",
] as const;

export const DESIGN_SYSTEM_DOCUMENTATION_WIRING_PATHS = [
  DESIGN_SYSTEM_DOCUMENTATION_DOC_PATH,
  "lib/design/design-system-doc-policy.ts",
  "services/design/design-system-doc-service.ts",
  "lib/design/design-system-documentation-absolute-final-policy.ts",
  "lib/design/design-system-documentation-audit.ts",
  "tests/unit/design-system-documentation.test.ts",
  "tests/unit/design-system-doc.test.ts",
] as const;

export const DESIGN_SYSTEM_DOCUMENTATION_UNIT_TEST =
  "tests/unit/design-system-documentation.test.ts" as const;

export const DESIGN_SYSTEM_DOCUMENTATION_CI_SCRIPTS = [
  "test:ci:design-system-documentation",
  "test:ci:design-system-documentation:cert",
] as const;

export type DesignSystemTop20Component = (typeof DESIGN_SYSTEM_TOP_20_COMPONENTS)[number];
