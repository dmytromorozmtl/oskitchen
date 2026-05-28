/**
 * Channel pilot setup wizard — Evolution Era 17 Workstream H Cycle 34.
 *
 * Streamlines Woo/Shopify pilot setup from 9 scattered steps to 5 in-app wizard steps.
 * Does NOT claim live marketplace ops or production-certified integrations.
 */

import { CHANNEL_PILOT_PLAYBOOK_ERA17_POLICY_ID } from "@/lib/integrations/channel-pilot-playbook-era17-policy";

export const CHANNEL_PILOT_SETUP_WIZARD_ERA17_POLICY_ID =
  "era17-channel-pilot-setup-wizard-v1" as const;

export const CHANNEL_PILOT_SETUP_WIZARD_ERA17_DECISION_DATE = "2026-05-28" as const;

export const CHANNEL_PILOT_SETUP_WIZARD_ERA17_EXTENDS_POLICIES = [
  CHANNEL_PILOT_PLAYBOOK_ERA17_POLICY_ID,
] as const;

export const CHANNEL_PILOT_SETUP_WIZARD_ERA17_PROOF_STATUS =
  "pilot_setup_wizard_ready" as const;

export const CHANNEL_PILOT_SETUP_WIZARD_ERA17_STEPS_MODULE =
  "lib/integrations/channel-pilot-setup-wizard-steps.ts" as const;

export const CHANNEL_PILOT_SETUP_WIZARD_ERA17_COMPONENT =
  "components/integrations/channel-pilot-setup-wizard.tsx" as const;

export const CHANNEL_PILOT_SETUP_WIZARD_ERA17_DOC =
  "docs/channel-pilot-setup-wizard-era17.md" as const;

export const CHANNEL_PILOT_SETUP_WIZARD_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-channel-pilot-setup-wizard-era17.ts" as const;

export const CHANNEL_PILOT_SETUP_WIZARD_ERA17_SUMMARY_ARTIFACT =
  "artifacts/channel-pilot-setup-wizard-summary.json" as const;

export const CHANNEL_PILOT_SETUP_WIZARD_ERA17_NPM_SCRIPT =
  "smoke:channel-pilot-setup-wizard" as const;

export const CHANNEL_PILOT_SETUP_WIZARD_ERA17_WIRED_PAGES = [
  "app/dashboard/integrations/woocommerce/page.tsx",
  "app/dashboard/integrations/shopify/page.tsx",
] as const;

export const CHANNEL_PILOT_SETUP_WIZARD_ERA17_CANONICAL_MARKERS = [
  CHANNEL_PILOT_SETUP_WIZARD_ERA17_POLICY_ID,
  "smoke:channel-pilot-setup-wizard",
  "pilot_setup_wizard_ready",
  "ChannelPilotSetupWizard",
  "evaluateChannelPilotSetupProgress",
] as const;

export const CHANNEL_PILOT_SETUP_WIZARD_ERA17_CI_SCRIPTS = [
  "test:ci:channel-pilot-setup-wizard-era17",
  "test:ci:channel-pilot-setup-wizard-era17:cert",
] as const;

export const CHANNEL_PILOT_SETUP_WIZARD_ERA17_UNIT_TESTS = [
  "tests/unit/channel-pilot-setup-wizard-steps.test.ts",
  "tests/unit/channel-pilot-setup-wizard-era17-policy.test.ts",
  "tests/unit/channel-pilot-setup-wizard-era17-cert-live.test.ts",
] as const;

export const CHANNEL_PILOT_SETUP_WIZARD_ERA17_CANONICAL_DOC_PATHS = [
  CHANNEL_PILOT_SETUP_WIZARD_ERA17_DOC,
  "docs/channel-pilot-playbook-era17.md",
  "docs/commercial-pilot-runbook.md",
  "docs/feature-maturity-matrix.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
  "docs/ci-e2e-tier-matrix.md",
] as const;

export const CHANNEL_PILOT_SETUP_WIZARD_ERA17_REVIEW_SECTION =
  "Era 17 channel pilot setup wizard (2026-05-28)" as const;

export const CHANNEL_PILOT_SETUP_WIZARD_ERA17_BACKLOG_ID = "KOS-E17-033" as const;

export const CHANNEL_PILOT_SETUP_WIZARD_ERA17_FORBIDDEN_CLAIMS = [
  "one-click marketplace connect",
  "production-certified woo shopify for all tenants",
  "full bidirectional sync live",
] as const;
