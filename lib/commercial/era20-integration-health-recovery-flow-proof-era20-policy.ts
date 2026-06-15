/**
 * Era 20 — Integration issue → Health Center recovery flow proof (Workstream G Cycle 18).
 */

import { ERA20_OPERATOR_GOLDEN_PATH_PROOF_POLICY_ID } from "@/lib/commercial/era20-operator-golden-path-proof-era20-policy";

export const ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_POLICY_ID =
  "era20-integration-health-recovery-flow-proof-v1" as const;

export const ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_BACKLOG_ID = "KOS-E20-018" as const;

export const ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_WORKFLOW_ID =
  "integration_health_recovery" as const;

export const ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_HOP_IDS = [
  "channel_health_detect",
  "smoke_artifact_honesty",
  "recovery_checklist",
  "safe_remediation",
  "live_smoke_proof",
] as const;

export const ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_CI_SCRIPTS = [
  "test:ci:era20-integration-health-recovery-flow-proof",
  "test:ci:era20-integration-health-recovery-flow-proof:cert",
] as const;

export const ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_UNIT_TESTS = [
  "tests/unit/era20-integration-health-recovery-flow-proof.test.ts",
  "tests/unit/era20-integration-health-recovery-flow-proof-cert-live.test.ts",
] as const;

export const ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_DOC =
  "docs/era20-integration-health-recovery-flow-proof-2026-05-28.md" as const;

export const ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_EXTENDS_POLICIES = [
  ERA20_OPERATOR_GOLDEN_PATH_PROOF_POLICY_ID,
  "era19-integration-health-recovery-v1",
  "era20-integration-health-trust-layer-v1",
] as const;
