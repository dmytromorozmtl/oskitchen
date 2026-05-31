/**
 * Era 20 first paid pilot package — Workstream C (proof era).
 *
 * Consolidates ICP segments, scope, checklists, and sales-safe language.
 * Does NOT claim GO, signed LOI, or P0 proof without artifacts.
 */

import { PILOT_ICP_CONTRACT_ERA17_POLICY_ID } from "@/lib/commercial/pilot-icp-contract-era17-policy";
import { PILOT_GONOGO_ERA17_POLICY_ID } from "@/lib/commercial/pilot-gono-go-era17-policy";
import { P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import { COMMERCIAL_PILOT_RUNBOOK_POLICY_ID } from "@/lib/commercial/commercial-pilot-runbook-policy";

export const ERA20_FIRST_PAID_PILOT_PACKAGE_POLICY_ID =
  "era20-first-paid-pilot-package-v1" as const;

export const ERA20_FIRST_PAID_PILOT_PACKAGE_DECISION_DATE = "2026-05-28" as const;

export const ERA20_FIRST_PAID_PILOT_PACKAGE_DOC =
  "docs/era20-first-paid-pilot-package-2026-05-28.md" as const;

export const ERA20_FIRST_PAID_PILOT_PACKAGE_MODULE =
  "lib/commercial/era20-first-paid-pilot-package.ts" as const;

export const ERA20_FIRST_PAID_PILOT_PACKAGE_STATUS =
  "pilot_package_ready_awaiting_p0_and_customer" as const;

export const ERA20_FIRST_PAID_PILOT_PACKAGE_EXTENDS_POLICIES = [
  COMMERCIAL_PILOT_RUNBOOK_POLICY_ID,
  PILOT_ICP_CONTRACT_ERA17_POLICY_ID,
  PILOT_GONOGO_ERA17_POLICY_ID,
  P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID,
  "era19-launch-wizard-v1",
  "era19-owner-daily-briefing-v1",
  "era19-integration-health-smoke-artifacts-v1",
] as const;

export const ERA20_FIRST_PAID_PILOT_PACKAGE_ICP_SEGMENTS = [
  "cafe",
  "ghost_kitchen",
  "meal_prep",
  "catering",
  "small_fast_casual",
] as const;

export const ERA20_FIRST_PAID_PILOT_PACKAGE_REQUIRED_SECTIONS = [
  "Ideal ICP by segment",
  "Included pilot modules",
  "Excluded modules (pilot SOW)",
  "Support boundaries",
  "Onboarding checklist (Launch Wizard — primary path)",
  "Launch checklist",
  "Training checklist",
  "Support checklist (OS Kitchen)",
  "Success metrics (90-day pilot)",
  "Pricing hypothesis (not in-product billing SKU yet)",
  "LOI / contract language",
  "Forbidden claims",
  "Rollback process",
  "Prospect placeholder rules (Era 20)",
  "P0 proof gate (honest — Era 20 Cycle 1)",
] as const;

export const ERA20_FIRST_PAID_PILOT_PACKAGE_INCLUDED_MODULES = [
  "order_hub",
  "manual_orders",
  "storefront_checkout",
  "pos_software_checkout",
  "kds_bump_recall",
  "production_board_calendar",
  "packing_verification",
  "crm_customers_segments",
  "billing",
  "launch_wizard",
  "owner_daily_briefing",
  "integration_health_center",
  "go_live_checklist",
] as const;

export const ERA20_FIRST_PAID_PILOT_PACKAGE_EXCLUDED_MODULES = [
  "production_sso_all_staff",
  "soc2_scim",
  "unified_inventory_depletion",
  "unified_rewards_ledger",
  "marketplace_live_doordash_uber_grubhub",
  "pos_hardware_offline",
  "rush_hour_kds_slo",
  "public_api_sla",
  "campaigns_preview",
  "food_safety_haccp_depth",
] as const;

export const ERA20_FIRST_PAID_PILOT_PACKAGE_PROSPECT_ENV_VAR =
  "PILOT_GONOGO_PROSPECT_NAME" as const;

export const ERA20_FIRST_PAID_PILOT_PACKAGE_PROSPECT_DISCLAIMER =
  "PROSPECT ONLY — not a signed customer; does not satisfy GO/NO-GO customer gate" as const;

export const ERA20_FIRST_PAID_PILOT_PACKAGE_CI_SCRIPTS = [
  "test:ci:era20-first-paid-pilot-package",
  "test:ci:era20-first-paid-pilot-package:cert",
] as const;

export const ERA20_FIRST_PAID_PILOT_PACKAGE_UNIT_TESTS = [
  "tests/unit/era20-first-paid-pilot-package-policy.test.ts",
  "tests/unit/era20-first-paid-pilot-package.test.ts",
  "tests/unit/era20-first-paid-pilot-package-cert-live.test.ts",
  "tests/unit/era20-pilot-gono-go-prospect-placeholder.test.ts",
] as const;

export const ERA20_FIRST_PAID_PILOT_PACKAGE_CANONICAL_DOC_PATHS = [
  ERA20_FIRST_PAID_PILOT_PACKAGE_DOC,
  "docs/commercial-pilot-runbook.md",
  "docs/pilot-icp-contract-template-era17.md",
  "docs/era18-p0-staging-proof-ops-checklist.md",
  "docs/feature-maturity-matrix.md",
  "docs/implementation-backlog.md",
  "docs/next-master-prompt-input-post-era19-2026-05-28.md",
] as const;

export const ERA20_FIRST_PAID_PILOT_PACKAGE_REVIEW_SECTION =
  "Era 20 first paid pilot package (2026-05-28)" as const;

export const ERA20_FIRST_PAID_PILOT_PACKAGE_CANONICAL_MARKERS = [
  ERA20_FIRST_PAID_PILOT_PACKAGE_POLICY_ID,
  "first paid pilot package",
  "prospect placeholder",
  ERA20_FIRST_PAID_PILOT_PACKAGE_PROSPECT_ENV_VAR,
] as const;
