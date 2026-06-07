/**
 * Absolute Final Task 138 — KDS daisy-chain config GTM scale (feature 93).
 *
 * @see docs/kds-daisy-chain-gtm-scale.md
 * @see components/dashboard/kitchen/kds-daisy-chain-config-panel.tsx
 */

export const KDS_DAISY_CHAIN_GTM_SCALE_ABSOLUTE_FINAL_POLICY_ID =
  "kds-daisy-chain-gtm-scale-absolute-final-v1" as const;

export const KDS_DAISY_CHAIN_GTM_SCALE_DOC_PATH = "docs/kds-daisy-chain-gtm-scale.md" as const;

export const KDS_DAISY_CHAIN_GTM_SCALE_HONESTY_MARKERS = [
  "NCR Aloha parity",
  "BETA",
  "bump handoff",
  "proprietary",
  "sales-safe",
] as const;

export const KDS_DAISY_CHAIN_GTM_SCALE_WIRING_PATHS = [
  KDS_DAISY_CHAIN_GTM_SCALE_DOC_PATH,
  "components/dashboard/kitchen/kds-daisy-chain-config-panel.tsx",
  "lib/kitchen/kds-daisy-chain-config-absolute-final-policy.ts",
  "lib/marketing/kds-daisy-chain-gtm-scale-absolute-final-policy.ts",
  "lib/marketing/kds-daisy-chain-gtm-scale-audit.ts",
  "tests/unit/kds-daisy-chain-config-absolute-final.test.ts",
] as const;
