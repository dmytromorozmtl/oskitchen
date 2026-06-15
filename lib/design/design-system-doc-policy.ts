/**
 * DES-39 — canonical design system documentation policy.
 *
 * @see docs/design-system.md
 */

export const DESIGN_SYSTEM_DOC_POLICY_ID = "design-system-doc-des39-v1" as const;

export const DESIGN_SYSTEM_DOC_PATH = "docs/design-system.md" as const;

export const DESIGN_SYSTEM_DOC_ANCHORS = [
  "design-system-doc-des39-v1",
  "design-system-documentation-absolute-final-v1",
  "## Foundation",
  "## Token registry",
  "## Layout primitives",
  "## State patterns",
  "## Role surfaces",
  "## Mobile-first operator UX",
  "## Dark mode",
  "## Audit policy index",
  "## Component primitives",
  "## Component catalog (top 20)",
  "## Data visualization",
  "## Enterprise and labor surfaces",
  "## Offline resilience UI",
  "## Absolute Final extensions (Tasks 56–63)",
  "## References",
] as const;

export const DESIGN_SYSTEM_POLICY_MODULES = [
  "lib/design/color-tokens.ts",
  "lib/design/z-index-scale.ts",
  "lib/design/icon-system.ts",
  "lib/design/page-layout-patterns.ts",
  "lib/design/dark-mode-consistency-policy.ts",
  "lib/design/dark-mode-everywhere-policy.ts",
  "lib/design/mobile-first-redesign-policy.ts",
  "lib/design/mobile-first-redesign-absolute-final-policy.ts",
  "lib/design/stabilization-design-patterns.ts",
  "lib/accessibility/skip-link-main-landmark-policy.ts",
  "lib/analytics/data-viz-standards-policy.ts",
  "lib/enterprise/multi-location-map-view-policy.ts",
  "lib/labor/schedule-grid-design-policy.ts",
  "lib/pos/offline-mode-ui-indicator-policy.ts",
  "lib/design/new-components-dark-mode-audit-policy.ts",
  "lib/design/design-system-documentation-absolute-final-policy.ts",
] as const;
