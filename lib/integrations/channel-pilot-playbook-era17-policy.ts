/**
 * Channel pilot playbook — Evolution Era 17 Cycle 10.
 *
 * One-page Woo/Shopify operator guide for paid pilots.
 * Does NOT claim full marketplace live ops or production-certified integrations.
 */

import { CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_POLICY_ID } from "@/lib/integrations/channel-github-workflow-first-green-era17-policy";
import { CHANNEL_LIVE_SMOKE_ERA16_POLICY_ID } from "@/lib/integrations/channel-live-smoke-era16-policy";
import { CHANNEL_LIVE_SMOKE_SHOPIFY_ERA17_POLICY_ID } from "@/lib/integrations/channel-live-smoke-shopify-era17-policy";
import { CHANNEL_LIVE_SMOKE_WOO_ERA17_POLICY_ID } from "@/lib/integrations/channel-live-smoke-woo-era17-policy";

export const CHANNEL_PILOT_PLAYBOOK_ERA17_POLICY_ID =
  "era17-channel-pilot-playbook-v1" as const;

export const CHANNEL_PILOT_PLAYBOOK_ERA17_DECISION_DATE = "2026-05-28" as const;

export const CHANNEL_PILOT_PLAYBOOK_ERA17_DOC =
  "docs/channel-pilot-playbook-era17.md" as const;

export const CHANNEL_PILOT_PLAYBOOK_ERA17_EXTENDS_POLICIES = [
  CHANNEL_LIVE_SMOKE_ERA16_POLICY_ID,
  CHANNEL_LIVE_SMOKE_WOO_ERA17_POLICY_ID,
  CHANNEL_LIVE_SMOKE_SHOPIFY_ERA17_POLICY_ID,
  CHANNEL_GITHUB_WORKFLOW_FIRST_GREEN_ERA17_POLICY_ID,
  "era4-channel-golden-path-v1",
  "era14-channel-golden-path-recert-v1",
] as const;

/** Operator-facing playbook — not a substitute for engineering cert or live smoke PASS. */
export const CHANNEL_PILOT_PLAYBOOK_ERA17_STATUS = "operator_ready" as const;

export const CHANNEL_PILOT_PLAYBOOK_ERA17_REQUIRED_SECTIONS = [
  "Purpose and honest scope",
  "Before you start",
  "WooCommerce test shop path",
  "Shopify test shop path",
  "Validation and smoke artifacts",
  "Forbidden pilot claims",
  "Support boundaries and rollback",
  "Sign-off checklist",
] as const;

export const CHANNEL_PILOT_PLAYBOOK_ERA17_OPERATOR_STEPS = [
  "Confirm Tier 0 governance bundles PASS on release commit (commercial-pilot-runbook Tier 0).",
  "Use a dedicated test shop only — never production customer catalog or PII.",
  "Save Woo or Shopify credentials in Dashboard → Integrations; run Test connection.",
  "Configure webhooks from dashboard URLs; confirm signatureValid on Sales channels → Webhooks.",
  "Run in-app certification checks on the integration page.",
  "Engineering: npm run smoke:channel-golden-path (synthetic) + optional smoke:woo-shopify-live.",
  "Review channel-live-smoke-summary.json — SKIPPED WITH REASON is honest when credentials missing.",
  "Optional GitHub: workflow_dispatch woo-shopify-staging-smoke.yml; record run URL.",
  "Document outcome in pilot tracker; do not claim full marketplace live ops.",
] as const;

export const CHANNEL_PILOT_PLAYBOOK_ERA17_VALIDATION_COMMANDS = [
  "npm run test:ci:channel-golden-path:cert",
  "npm run smoke:channel-golden-path",
  "npm run smoke:woo-shopify-live",
  "npm run smoke:channel-github-workflow-first-green",
] as const;

export const CHANNEL_PILOT_PLAYBOOK_ERA17_CANONICAL_MARKERS = [
  CHANNEL_PILOT_PLAYBOOK_ERA17_POLICY_ID,
  "era17-channel-pilot-playbook",
  "qualified test shop",
  "not full marketplace live ops",
  "channel-live-smoke-summary",
] as const;

export const CHANNEL_PILOT_PLAYBOOK_ERA17_FORBIDDEN_CLAIMS = [
  "production-certified marketplace integration",
  "full bidirectional sync live",
  "live marketplace ops for all tenants",
  "DoorDash/Uber Eats parity",
] as const;

export const CHANNEL_PILOT_PLAYBOOK_ERA17_CI_SCRIPTS = [
  "test:ci:channel-pilot-playbook-era17",
  "test:ci:channel-pilot-playbook-era17:cert",
] as const;

export const CHANNEL_PILOT_PLAYBOOK_ERA17_UNIT_TESTS = [
  "tests/unit/channel-pilot-playbook-era17-policy.test.ts",
  "tests/unit/channel-pilot-playbook-era17-cert-live.test.ts",
] as const;

export const CHANNEL_PILOT_PLAYBOOK_ERA17_CANONICAL_DOC_PATHS = [
  CHANNEL_PILOT_PLAYBOOK_ERA17_DOC,
  "docs/commercial-pilot-runbook.md",
  "docs/WOO_SHOPIFY_CERTIFICATION_CHECKLIST.md",
  "docs/feature-maturity-matrix.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
] as const;

export const CHANNEL_PILOT_PLAYBOOK_ERA17_REVIEW_SECTION =
  "Era 17 channel pilot playbook (2026-05-28)" as const;

export const CHANNEL_PILOT_PLAYBOOK_ERA17_RELATED_DOCS = [
  "docs/WOO_SHOPIFY_TEST_SHOP_SETUP.md",
  "docs/WOO_SHOPIFY_CERTIFICATION_CHECKLIST.md",
  "docs/channel-golden-path-honesty-checklist.md",
] as const;
