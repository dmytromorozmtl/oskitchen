/**
 * DES-39 — canonical design system documentation policy.
 *
 * @see docs/design-system.md
 */

export const DESIGN_SYSTEM_DOC_POLICY_ID = "design-system-doc-des39-v1" as const;

export const DESIGN_SYSTEM_DOC_PATH = "docs/design-system.md" as const;

export const DESIGN_SYSTEM_DOC_ANCHORS = [
  "design-system-doc-des39-v1",
  "## Foundation",
  "## Token registry",
  "## Layout primitives",
  "## State patterns",
  "## Role surfaces",
  "## Mobile-first operator UX",
  "## Dark mode",
  "## Audit policy index",
  "## Component primitives",
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
  "lib/design/stabilization-design-patterns.ts",
] as const;
