/**
 * Linear chain terminus guard policy — Step 17 FORBIDDEN (not a catalog step).
 */
import { LINEAR_CHAIN_TERMINUS_GUARD_ERA24_POLICY_ID } from "@/lib/commercial/linear-chain-terminus-guard-era24";
import { LINEAR_CHAIN_TERMINUS_GUARD_UI_ERA24_POLICY_ID } from "@/lib/commercial/linear-chain-terminus-guard-ui-era24";
import { LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_POLICY_ID } from "@/lib/commercial/linear-path-permanently-closed-era24-policy";

export { LINEAR_CHAIN_TERMINUS_GUARD_ERA24_POLICY_ID };

export const LINEAR_CHAIN_TERMINUS_GUARD_ERA24_BACKLOG_ID = "KOS-E24-017-GUARD" as const;

export const LINEAR_CHAIN_TERMINUS_GUARD_ERA24_EXTENDS_POLICIES = [
  LINEAR_PATH_PERMANENTLY_CLOSED_ERA24_POLICY_ID,
  LINEAR_CHAIN_TERMINUS_GUARD_ERA24_POLICY_ID,
  LINEAR_CHAIN_TERMINUS_GUARD_UI_ERA24_POLICY_ID,
  "era24-linear-chain-terminus-guard-post-linear-path-closed-orchestrator-v1",
] as const;

export const LINEAR_CHAIN_TERMINUS_GUARD_ERA24_OPS_SCRIPTS = [
  "ops:run-linear-chain-terminus-guard-post-linear-path-closed-orchestrator",
  "ops:validate-linear-chain-terminus-guard",
  "ops:sync-linear-chain-terminus-guard-report",
  "ops:validate-linear-chain-terminus-guard-integrity",
  "ops:sync-linear-chain-terminus-guard-integrity-baseline",
] as const;

export const LINEAR_CHAIN_TERMINUS_GUARD_ERA24_CI_SCRIPTS = [
  "test:ci:linear-chain-terminus-guard-era24",
  "test:ci:linear-chain-terminus-guard-era24:cert",
  "test:ci:linear-chain-terminus-guard-integrity-era41",
] as const;

export const LINEAR_CHAIN_TERMINUS_GUARD_ERA24_UNIT_TESTS = [
  "tests/unit/linear-chain-terminus-guard-post-linear-path-closed-orchestrator-era24.test.ts",
  "tests/unit/linear-chain-terminus-guard-ui-era24.test.ts",
  "tests/unit/run-linear-chain-terminus-guard-post-linear-path-closed-orchestrator.test.ts",
  "tests/unit/linear-chain-terminus-guard-era24.test.ts",
  "tests/unit/validate-linear-chain-terminus-guard.test.ts",
  "tests/unit/linear-chain-terminus-guard-era24-cert-live.test.ts",
] as const;

export const LINEAR_CHAIN_TERMINUS_GUARD_ERA24_PRODUCT_SURFACES = [
  "components/dashboard/launch-wizard/launch-wizard-linear-chain-terminus-guard-panel.tsx",
  "components/dashboard/maintenance-mode-panel.tsx",
  "components/platform/commercial-pilot-ops-status-panel.tsx",
] as const;
