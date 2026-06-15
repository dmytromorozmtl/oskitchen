/**
 * Era 146 — First design partner LOI signed wiring cert (Phase 10 #73).
 *
 * Full path: signed LOI record → design partner profile → pilot GO/NO-GO gate.
 */

import {
  LOI_SIGNED_ERA73_DOC,
  LOI_SIGNED_ERA73_DOC_REQUIRED_HEADINGS,
  LOI_SIGNED_ERA73_FORBIDDEN_CLAIMS,
  LOI_SIGNED_ERA73_LOI_SKU,
  LOI_SIGNED_ERA73_POLICY_ID,
  LOI_SIGNED_ERA73_POST_SIGNATURE_STEPS,
  LOI_SIGNED_ERA73_TEMPLATE_DOC,
} from "@/lib/commercial/loi-signed-era73-policy";

export const LOI_SIGNED_ERA146_POLICY_ID = "era146-first-loi-signed-v1" as const;

export const LOI_SIGNED_ERA146_SUMMARY_ARTIFACT =
  "artifacts/loi-signed-era146-smoke-summary.json" as const;

export const LOI_SIGNED_ERA146_NPM_SCRIPT = "smoke:loi-signed-era146" as const;

export const LOI_SIGNED_ERA146_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-loi-signed-era146.ts" as const;

export const LOI_SIGNED_ERA146_OPS_DOC = "docs/loi-signed-era146-setup.md" as const;

export const LOI_SIGNED_ERA146_CANONICAL_DOC = LOI_SIGNED_ERA73_DOC;

export const LOI_SIGNED_ERA146_WIRING_PATHS = [
  LOI_SIGNED_ERA73_DOC,
  LOI_SIGNED_ERA73_TEMPLATE_DOC,
  "docs/loi-template-walkthrough.md",
  "lib/commercial/loi-signed-era73-policy.ts",
  "lib/commercial/pilot-gono-go-era17-policy.ts",
  "scripts/smoke-pilot-gono-go-era17.ts",
  "tests/unit/loi-signed-era73.test.ts",
] as const;

export const LOI_SIGNED_ERA146_CYCLE_RUNBOOK_STEPS = [
  "Confirm countersigned LOI PDF archived in legal evidence folder (not git).",
  "Verify docs/loi-signed.md — LOI-DP-001 Riverbend Commissary LLC signed 2026-06-05.",
  "Set PILOT_GONOGO_CUSTOMER_NAME + PILOT_GONOGO_LOI_SIGNED_DATE from signed record.",
  "Provision staging workspace riverbend-commissary and Week 0 kickoff.",
  "Run npm run smoke:pilot-gono-go — commercial GO artifact after env set.",
  "Run npm run smoke:loi-signed-era146 — artifact overall PASSED.",
] as const;

export const LOI_SIGNED_ERA146_CI_SCRIPTS = [
  "test:ci:loi-signed-era146",
  "test:ci:loi-signed-era146:cert",
] as const;

export const LOI_SIGNED_ERA146_UNIT_TESTS = [
  "tests/unit/loi-signed-era146.test.ts",
  "tests/unit/loi-signed-era73.test.ts",
  "tests/unit/loi-template-walkthrough-policy.test.ts",
] as const;

export const LOI_SIGNED_ERA146_CANONICAL_POLICY_ID = LOI_SIGNED_ERA73_POLICY_ID;

export const LOI_SIGNED_ERA146_LOI_SKU = LOI_SIGNED_ERA73_LOI_SKU;

export const LOI_SIGNED_ERA146_DOC_REQUIRED_HEADINGS = LOI_SIGNED_ERA73_DOC_REQUIRED_HEADINGS;

export const LOI_SIGNED_ERA146_FORBIDDEN_CLAIMS = LOI_SIGNED_ERA73_FORBIDDEN_CLAIMS;

export const LOI_SIGNED_ERA146_POST_SIGNATURE_STEPS = LOI_SIGNED_ERA73_POST_SIGNATURE_STEPS;

export const LOI_SIGNED_ERA146_CAPABILITIES = [
  "signed_loi_record",
  "design_partner_profile",
  "pilot_gono_go_gate",
] as const;
