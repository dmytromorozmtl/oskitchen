/**
 * Era 20 — integration Health Center recovery golden path for Tier 2 integrations phase.
 */

import {
  ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_HOP_IDS,
  ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_POLICY_ID,
  ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_WORKFLOW_ID,
} from "@/lib/commercial/era20-integration-health-recovery-flow-proof-era20-policy";
import { getEra20OperatorWorkflowProof } from "@/lib/commercial/era20-operator-golden-path-proof-era20";
import { resolveP0ChannelProofPassed } from "@/lib/commercial/era20-storefront-fulfillment-flow-proof-era20";
import { INTEGRATION_HEALTH_CHANNEL_CARDS_ANCHOR } from "@/lib/integrations/integration-health-channel-cards-era19-policy";
import { INTEGRATION_HEALTH_P0_TRUST_BANNER_ANCHOR } from "@/lib/integrations/integration-health-trust-layer-era20-policy";
import { INTEGRATION_HEALTH_RECOVERY_ANCHOR } from "@/lib/integrations/integration-health-recovery-era19-policy";
import { INTEGRATION_HEALTH_SMOKE_NEXT_ACTION_ANCHOR } from "@/lib/integrations/integration-health-smoke-artifacts-depth-era19-policy";

export type IntegrationHealthRecoveryFlowHopId =
  (typeof ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_HOP_IDS)[number];

export type IntegrationHealthRecoveryFlowHopProofState =
  | "real_ci"
  | "staging_manual"
  | "blocked_p0";

export type IntegrationHealthRecoveryFlowHop = {
  id: IntegrationHealthRecoveryFlowHopId;
  order: number;
  label: string;
  uiHref: string;
  servicePath: string;
  dataPath: string;
  rbac: string;
  tests: readonly string[];
  proofState: IntegrationHealthRecoveryFlowHopProofState;
  blocker: string | null;
  nextAction: string;
};

export type IntegrationHealthRecoveryFlowProofSlice = {
  policyId: typeof ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_POLICY_ID;
  workflowId: typeof ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_WORKFLOW_ID;
  headline: string;
  tier2PhaseId: string;
  hops: readonly IntegrationHealthRecoveryFlowHop[];
  ciBackedHopCount: number;
  stagingManualHopCount: number;
  blockedHopCount: number;
  parentWorkflowBlocker: string;
  parentWorkflowNextAction: string;
};

const IH_BASE = "/dashboard/integration-health";

const HOP_DEFINITIONS: readonly Omit<
  IntegrationHealthRecoveryFlowHop,
  "proofState" | "blocker"
>[] = [
  {
    id: "channel_health_detect",
    order: 1,
    label: "Detect channel / webhook issue",
    uiHref: `${IH_BASE}${INTEGRATION_HEALTH_CHANNEL_CARDS_ANCHOR}`,
    servicePath: "services/integrations/integration-health-channel-cards-service.ts",
    dataPath: "Stripe, Woo, Shopify, webhook cards — honest CONNECTED vs SKIPPED",
    rbac: "integrations.read / integrations.manage",
    tests: ["tests/unit/integration-health-channel-cards-era19.test.ts"],
    nextAction: "Review failing channel card and last error",
  },
  {
    id: "smoke_artifact_honesty",
    order: 2,
    label: "Smoke artifact honesty",
    uiHref: `${IH_BASE}${INTEGRATION_HEALTH_SMOKE_NEXT_ACTION_ANCHOR}`,
    servicePath: "services/integrations/integration-health-smoke-artifacts-service.ts",
    dataPath: "P0 / channel / GitHub artifact rows — SKIPPED WITH REASON never fake PASS",
    rbac: "integrations.read",
    tests: [
      "tests/unit/integration-health-smoke-artifacts-era19.test.ts",
      "tests/unit/integration-health-trust-layer-era20.test.ts",
    ],
    nextAction: "Read P0 row missing env vars; follow next-action link",
  },
  {
    id: "recovery_checklist",
    order: 3,
    label: "Recovery checklist",
    uiHref: `${IH_BASE}${INTEGRATION_HEALTH_RECOVERY_ANCHOR}`,
    servicePath: "lib/integrations/integration-health-recovery-era19.ts",
    dataPath: "Prioritized steps from channel cards + smoke artifacts",
    rbac: "integrations.read",
    tests: ["tests/unit/integration-health-recovery-era19.test.ts"],
    nextAction: "Walk checklist — no risky mutations from Health Center",
  },
  {
    id: "safe_remediation",
    order: 4,
    label: "Safe remediation links",
    uiHref: "/dashboard/sales-channels/webhooks",
    servicePath: "lib/integrations/integration-health-recovery-era19-policy.ts",
    dataPath: "Webhook queue, product mapping, import center, error recovery deep links",
    rbac: "integrations.manage for replay; read for triage",
    tests: ["tests/unit/integration-health-recovery-era19.test.ts"],
    nextAction: "Fix mapping or replay webhook after root cause identified",
  },
  {
    id: "live_smoke_proof",
    order: 5,
    label: "Live Woo/Shopify smoke proof",
    uiHref: `${IH_BASE}${INTEGRATION_HEALTH_P0_TRUST_BANNER_ANCHOR}`,
    servicePath: "lib/integrations/channel-live-smoke-summary.ts",
    dataPath: "artifacts/channel-live-smoke-summary.json — P0 child #3",
    rbac: "ops credentials + owner email for channel smoke",
    tests: ["test:ci:channel-live-smoke:cert"],
    nextAction: "Configure 11 P0 env vars; npm run smoke:p0-staging-proof-unblock",
  },
];

export function deriveP0ChannelProofFromSmokeRows(
  rows: readonly { id: string; proofStatus: string | null }[],
): boolean {
  const p0Row = rows.find((r) => r.id === "p0-staging-proof-unblock");
  const channelRow = rows.find((r) => r.id === "channel-live-smoke");
  return resolveP0ChannelProofPassed(
    p0Row?.proofStatus ?? null,
    channelRow?.proofStatus ?? null,
  );
}

function resolveHopProofState(
  hopId: IntegrationHealthRecoveryFlowHopId,
  input: { p0ChannelProofPassed: boolean },
): { proofState: IntegrationHealthRecoveryFlowHopProofState; blocker: string | null } {
  if (hopId === "live_smoke_proof" && !input.p0ChannelProofPassed) {
    return {
      proofState: "blocked_p0",
      blocker:
        "Woo/Shopify live smoke SKIPPED — configure 11 P0 env vars before claiming channel LIVE",
    };
  }
  if (
    hopId === "channel_health_detect" ||
    hopId === "smoke_artifact_honesty" ||
    hopId === "recovery_checklist"
  ) {
    return { proofState: "real_ci", blocker: null };
  }
  return { proofState: "staging_manual", blocker: null };
}

export function buildIntegrationHealthRecoveryFlowHops(input: {
  p0ChannelProofPassed: boolean;
}): IntegrationHealthRecoveryFlowHop[] {
  return HOP_DEFINITIONS.map((hop) => {
    const { proofState, blocker } = resolveHopProofState(hop.id, input);
    return { ...hop, proofState, blocker };
  });
}

export function buildIntegrationHealthRecoveryFlowProofSlice(input: {
  p0ChannelProofPassed: boolean;
}): IntegrationHealthRecoveryFlowProofSlice {
  const hops = buildIntegrationHealthRecoveryFlowHops(input);
  const parent = getEra20OperatorWorkflowProof(
    ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_WORKFLOW_ID,
  );
  const ciBackedHopCount = hops.filter((h) => h.proofState === "real_ci").length;
  const stagingManualHopCount = hops.filter((h) => h.proofState === "staging_manual").length;
  const blockedHopCount = hops.filter((h) => h.proofState === "blocked_p0").length;

  let headline =
    "Integration recovery proof — detect issue, honest smoke artifacts, safe remediation; no fake green.";
  if (blockedHopCount > 0) {
    headline =
      "Live channel proof blocked by P0 credentials — internal recovery checklist still usable for pilot prep.";
  }

  return {
    policyId: ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_POLICY_ID,
    workflowId: ERA20_INTEGRATION_HEALTH_RECOVERY_FLOW_PROOF_WORKFLOW_ID,
    headline,
    tier2PhaseId: parent?.goldenPathPhaseId ?? "integrations",
    hops,
    ciBackedHopCount,
    stagingManualHopCount,
    blockedHopCount,
    parentWorkflowBlocker:
      parent?.blocker ?? "P0 channel/SSO smokes SKIPPED — honest SKIPPED states shown",
    parentWorkflowNextAction:
      parent?.nextAction ?? "Follow recovery checklist; run P0 smokes after ops vault",
  };
}
