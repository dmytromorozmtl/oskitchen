/**
 * Pilot inventory messaging — Evolution Era 17 Workstream G Cycle 30.
 *
 * Sales training for POS-only recipe depletion — no unified stock claims.
 * Does NOT unlock storefront depletion or claim cross-channel inventory parity.
 */

import { POS_ONLY_INVENTORY_LOCK_ERA17_POLICY_ID } from "@/lib/inventory/pos-only-inventory-lock-era17-policy";
import {
  INVENTORY_DEPLETION_GTM_LOCK_ID,
  INVENTORY_DEPLETION_POLICY_ID,
  INVENTORY_DEPLETION_STOREFRONT_HOOK_STATUS,
} from "@/lib/inventory/inventory-depletion-policy";

export const PILOT_INVENTORY_MESSAGING_ERA17_POLICY_ID =
  "era17-pilot-inventory-messaging-v1" as const;

export const PILOT_INVENTORY_MESSAGING_ERA17_DECISION_DATE = "2026-05-28" as const;

export const PILOT_INVENTORY_MESSAGING_ERA17_EXTENDS_POLICIES = [
  INVENTORY_DEPLETION_POLICY_ID,
  INVENTORY_DEPLETION_GTM_LOCK_ID,
  POS_ONLY_INVENTORY_LOCK_ERA17_POLICY_ID,
] as const;

/** Sales training doc wired — storefront hook remains deferred_locked. */
export const PILOT_INVENTORY_MESSAGING_ERA17_STATUS = "pilot_inventory_messaging_ready" as const;

export const PILOT_INVENTORY_MESSAGING_ERA17_DOC =
  "docs/pilot-inventory-messaging-era17.md" as const;

export const PILOT_INVENTORY_MESSAGING_ERA17_SUMMARY_MODULE =
  "lib/inventory/pilot-inventory-messaging-summary.ts" as const;

export const PILOT_INVENTORY_MESSAGING_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pilot-inventory-messaging-era17.ts" as const;

export const PILOT_INVENTORY_MESSAGING_ERA17_SUMMARY_ARTIFACT =
  "artifacts/pilot-inventory-messaging-summary.json" as const;

export const PILOT_INVENTORY_MESSAGING_ERA17_NPM_SCRIPT =
  "smoke:pilot-inventory-messaging" as const;

export const PILOT_INVENTORY_MESSAGING_ERA17_REQUIRED_SECTIONS = [
  "Purpose and honest scope",
  "What depletes in pilot",
  "What does not deplete",
  "Safe sales phrases",
  "Forbidden sales phrases",
  "Demo and discovery script",
  "Objection handling",
  "Pre-contract checklist",
] as const;

export const PILOT_INVENTORY_MESSAGING_ERA17_SAFE_SALES_PHRASES = [
  "POS register sales deplete recipe ingredients when products have active recipes configured",
  "Storefront and online orders do not reduce on-hand inventory in pilot scope",
  "Inventory counts and waste workflows are beta — qualified pilot path",
  "Cross-channel stock sync is not included in pilot — POS-only depletion",
] as const;

export const PILOT_INVENTORY_MESSAGING_ERA17_FORBIDDEN_PHRASES = [
  "unified inventory",
  "unified cross-channel depletion",
  "storefront checkout depletes stock",
  "online orders automatically reduce on-hand",
  "all channels deplete",
  "real-time inventory across POS and ecommerce",
] as const;

export const PILOT_INVENTORY_MESSAGING_ERA17_TRAINING_MODULES = [
  "pos-only-depletion-basics",
  "storefront-non-depleting",
  "demo-script",
  "contract-wording",
  "forbidden-claims-gate",
] as const;

export const PILOT_INVENTORY_MESSAGING_ERA17_CANONICAL_MARKERS = [
  PILOT_INVENTORY_MESSAGING_ERA17_POLICY_ID,
  "smoke:pilot-inventory-messaging",
  "pilot_inventory_messaging_ready",
  "deferred_locked",
  "POS-only depletion",
] as const;

export const PILOT_INVENTORY_MESSAGING_ERA17_FORBIDDEN_CLAIMS = [
  "unified inventory depletion",
  "storefront depletes stock in pilot",
  "toast inventory parity",
  "lightspeed unified stock",
  "cross-channel automatic depletion",
] as const;

export const PILOT_INVENTORY_MESSAGING_ERA17_CI_SCRIPTS = [
  "test:ci:pilot-inventory-messaging-era17",
  "test:ci:pilot-inventory-messaging-era17:cert",
] as const;

export const PILOT_INVENTORY_MESSAGING_ERA17_UNIT_TESTS = [
  "tests/unit/pilot-inventory-messaging-era17-policy.test.ts",
  "tests/unit/pilot-inventory-messaging-summary.test.ts",
  "tests/unit/pilot-inventory-messaging-era17-cert-live.test.ts",
] as const;

export const PILOT_INVENTORY_MESSAGING_ERA17_CANONICAL_DOC_PATHS = [
  PILOT_INVENTORY_MESSAGING_ERA17_DOC,
  "docs/pos-only-inventory-lock-era17.md",
  "docs/commercial-pilot-runbook.md",
  "docs/feature-maturity-matrix.md",
  "docs/product-positioning.md",
  "docs/competitor-feature-gap-matrix.md",
  "docs/pilot-icp-contract-template-era17.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
] as const;

export const PILOT_INVENTORY_MESSAGING_ERA17_REVIEW_SECTION =
  "Era 17 pilot inventory messaging (2026-05-28)" as const;

export const PILOT_INVENTORY_MESSAGING_ERA17_BACKLOG_ID = "KOS-E17-029" as const;

export const PILOT_INVENTORY_MESSAGING_ERA17_STOREFRONT_HOOK_STATUS =
  INVENTORY_DEPLETION_STOREFRONT_HOOK_STATUS;
