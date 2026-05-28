/**
 * Integration Health trust layer — Era 20 Workstream F Cycle 5.
 *
 * Surfaces honest P0/SKIPPED/FAILED states; never upgrades missing proof to LIVE or PASS.
 */

import { INTEGRATION_HEALTH_CHANNEL_CARDS_ERA19_POLICY_ID } from "@/lib/integrations/integration-health-channel-cards-era19-policy";
import { INTEGRATION_HEALTH_SMOKE_ARTIFACTS_ERA19_POLICY_ID } from "@/lib/integrations/integration-health-smoke-artifacts-era19-policy";
import { P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";

export const INTEGRATION_HEALTH_TRUST_LAYER_ERA20_POLICY_ID =
  "era20-integration-health-trust-layer-v1" as const;

export const INTEGRATION_HEALTH_TRUST_LAYER_ERA20_STATUS =
  "trust_layer_wired_awaiting_p0_proof" as const;

export const INTEGRATION_HEALTH_TRUST_LAYER_ERA20_EXTENDS_POLICIES = [
  INTEGRATION_HEALTH_CHANNEL_CARDS_ERA19_POLICY_ID,
  INTEGRATION_HEALTH_SMOKE_ARTIFACTS_ERA19_POLICY_ID,
  P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID,
] as const;

export const INTEGRATION_HEALTH_P0_TRUST_BANNER_ANCHOR =
  "#integration-health-p0-trust" as const;

export const INTEGRATION_HEALTH_TRUST_LAYER_ERA20_DOC =
  "docs/era20-integration-health-trust-layer-2026-05-28.md" as const;

export const INTEGRATION_HEALTH_TRUST_LAYER_ERA20_CI_SCRIPTS = [
  "test:ci:integration-health-trust-layer-era20",
  "test:ci:integration-health-trust-layer-era20:cert",
] as const;

export const INTEGRATION_HEALTH_TRUST_LAYER_ERA20_UNIT_TESTS = [
  "tests/unit/integration-health-trust-layer-era20.test.ts",
  "tests/unit/integration-health-trust-layer-era20-cert-live.test.ts",
] as const;

export const INTEGRATION_HEALTH_TRUST_LAYER_ERA20_REVIEW_SECTION =
  "Era 20 Integration Health trust layer (2026-05-28)" as const;

export const INTEGRATION_HEALTH_TRUST_LAYER_ERA20_CANONICAL_MARKERS = [
  INTEGRATION_HEALTH_TRUST_LAYER_ERA20_POLICY_ID,
  "integration-health-p0-trust",
  "trust_layer_wired_awaiting_p0_proof",
] as const;
