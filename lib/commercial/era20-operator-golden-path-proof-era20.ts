/**
 * Era 20 — operator golden path proof crosswalk (product routes ↔ Tier 2 checklist).
 */

import type { LaunchWizardStepId } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { ERA20_OPERATOR_GOLDEN_PATH_PROOF_POLICY_ID } from "@/lib/commercial/era20-operator-golden-path-proof-era20-policy";
import { PILOT_OPERATOR_GOLDEN_PATH_ERA17_PHASES } from "@/lib/commercial/pilot-operator-golden-path-era17-policy";

export type Era20OperatorWorkflowProofId =
  (typeof import("@/lib/commercial/era20-operator-golden-path-proof-era20-policy").ERA20_OPERATOR_GOLDEN_PATH_PROOF_WORKFLOW_IDS)[number];

export type Era20OperatorWorkflowE2eState =
  | "real_ci"
  | "staging_manual"
  | "pilot_manual";

export type Era20OperatorWorkflowProofRow = {
  id: Era20OperatorWorkflowProofId;
  label: string;
  actor: string;
  uiPath: readonly string[];
  services: readonly string[];
  rbac: string;
  tenantSafety: string;
  tests: readonly string[];
  goldenPathPhaseId: string | null;
  launchWizardStepId: LaunchWizardStepId | null;
  briefingEntry: string | null;
  e2eState: Era20OperatorWorkflowE2eState;
  blocker: string;
  nextAction: string;
};

export const ERA20_LAUNCH_WIZARD_GOLDEN_PATH_PHASE_BY_STEP: Record<
  LaunchWizardStepId,
  (typeof PILOT_OPERATOR_GOLDEN_PATH_ERA17_PHASES)[number]["id"]
> = {
  "business-profile": "onboarding",
  "menu-catalog": "onboarding",
  storefront: "storefront",
  pos: "pos",
  "kds-production": "kds",
  integrations: "integrations",
  "go-live-proof": "orders",
  "pilot-readiness": "onboarding",
};

export const ERA20_OPERATOR_GOLDEN_PATH_WORKFLOWS: readonly Era20OperatorWorkflowProofRow[] = [
  {
    id: "owner_briefing_to_action",
    label: "Owner Today → ranked action",
    actor: "owner",
    uiPath: ["/dashboard/today", "/dashboard/order-hub", "/dashboard/integration-health"],
    services: [
      "services/briefing/owner-daily-briefing-service.ts",
      "services/order-hub/order-hub-service.ts",
    ],
    rbac: "Role packs filter tiles; workspace-scoped queries",
    tenantSafety: "requireTenantActor on all briefing slices",
    tests: [
      "tests/unit/owner-daily-briefing-era19.test.ts",
      "tests/unit/owner-daily-briefing-fulfillment-command-flow-era19.test.ts",
    ],
    goldenPathPhaseId: "onboarding",
    launchWizardStepId: "pilot-readiness",
    briefingEntry: "/dashboard/today",
    e2eState: "staging_manual",
    blocker: "No outcome telemetry yet",
    nextAction: "Execute Tier 2 phase 1 on staging; click top briefing action",
  },
  {
    id: "launch_wizard_to_go_live",
    label: "Launch Wizard → go-live validation",
    actor: "owner",
    uiPath: ["/dashboard/launch-wizard", "/dashboard/go-live"],
    services: [
      "services/launch-wizard/launch-wizard-service.ts",
      "services/go-live/go-live-service.ts",
    ],
    rbac: "Owner/manager steps; commercial blockers read-only for staff",
    tenantSafety: "Workspace-scoped launch signals",
    tests: [
      "tests/unit/launch-wizard-era19.test.ts",
      "tests/unit/launch-wizard-onboarding-convergence-era19.test.ts",
    ],
    goldenPathPhaseId: "onboarding",
    launchWizardStepId: "go-live-proof",
    briefingEntry: "/dashboard/launch-wizard",
    e2eState: "staging_manual",
    blocker: "P0 + customer gates on pilot-readiness step",
    nextAction: "Complete wizard steps 1–7 before GO/NO-GO cutover",
  },
  {
    id: "storefront_to_packing",
    label: "Storefront order → hub → KDS → packing",
    actor: "owner, kitchen, packer",
    uiPath: [
      "/dashboard/storefront",
      "/dashboard/order-hub",
      "/dashboard/kitchen",
      "/dashboard/packing",
      "#packing-qc-clarity",
    ],
    services: [
      "services/storefront/",
      "services/order-hub/order-hub-service.ts",
      "services/kitchen-screen/kitchen-screen-service.ts",
      "services/packing/",
    ],
    rbac: "orders.manage, kitchen.bump, packing.manage",
    tenantSafety: "Order workspace scope end-to-end",
    tests: [
      "test:ci:storefront-money-path:cert",
      "tests/unit/order-hub-stuck-state-era18.test.ts",
      "tests/unit/kds-priority-lane-era19.test.ts",
      "tests/unit/packing-qc-clarity-era19.test.ts",
    ],
    goldenPathPhaseId: "orders",
    launchWizardStepId: "storefront",
    briefingEntry: "/dashboard/today → fulfillment tile",
    e2eState: "real_ci",
    blocker: "Live channel ingest requires P0 channel smoke PASS",
    nextAction: "Tier 2 phases 2–3 + 6 on staging",
  },
  {
    id: "pos_to_inventory",
    label: "POS checkout → receipt → POS-only depletion",
    actor: "cashier, manager",
    uiPath: ["/dashboard/pos/terminal", "/dashboard/pos/shifts"],
    services: [
      "services/pos/pos-checkout-service.ts",
      "services/inventory/inventory-depletion-policy.ts",
    ],
    rbac: "pos.checkout, pos.shift.*; manager for refund",
    tenantSafety: "POS-only inventory lock — no cross-channel depletion",
    tests: [
      "test:ci:pos-money-path:cert",
      "test:ci:inventory-depletion:cert",
      "tests/unit/pos-shift-close-clarity-era19.test.ts",
    ],
    goldenPathPhaseId: "pos",
    launchWizardStepId: "pos",
    briefingEntry: "/dashboard/today → POS shift tile",
    e2eState: "real_ci",
    blocker: "Hardware/offline not in pilot scope",
    nextAction: "Tier 2 phase 5 — open shift, sale, closeout with variance ack",
  },
  {
    id: "manager_discount_audit",
    label: "Manager discount → audit trail",
    actor: "manager",
    uiPath: ["/dashboard/pos/terminal#pos-manager-override"],
    services: ["services/pos/pos-checkout-service.ts", "services/audit/"],
    rbac: "pos.discount.apply, pos.manager.override",
    tenantSafety: "Denial audits on mutate; no PIN parity claim",
    tests: [
      "tests/unit/pos-manager-override-clarity-era19.test.ts",
      "tests/unit/pos-manager-discount-era17.test.ts",
    ],
    goldenPathPhaseId: "pos",
    launchWizardStepId: "pos",
    briefingEntry: "/dashboard/today → manager override tile",
    e2eState: "staging_manual",
    blocker: "Toast PIN parity not claimed",
    nextAction: "Spot-check discount + override on staging with manager role",
  },
  {
    id: "shift_closeout",
    label: "Shift open → sales → closeout",
    actor: "cashier, manager",
    uiPath: ["/dashboard/pos/shifts", "/dashboard/pos/terminal?speed=1"],
    services: ["services/pos/pos-shift-service.ts"],
    rbac: "pos.shift.open, pos.shift.close",
    tenantSafety: "Shift scoped to register + workspace",
    tests: ["tests/unit/pos-shift-close-clarity-era19.test.ts", "tests/unit/pos-shift-close-focus-era18.test.ts"],
    goldenPathPhaseId: "pos",
    launchWizardStepId: "pos",
    briefingEntry: "/dashboard/today → cashier pack",
    e2eState: "staging_manual",
    blocker: "None for software path",
    nextAction: "Tier 2 phase 5 closeout checklist on staging",
  },
  {
    id: "integration_health_recovery",
    label: "Integration issue → Health Center recovery",
    actor: "owner, support",
    uiPath: ["/dashboard/integration-health", "/dashboard/integration-health?mode=support"],
    services: [
      "services/integrations/integration-health-smoke-artifacts-service.ts",
      "services/integrations/integration-health-channel-cards-service.ts",
    ],
    rbac: "integrations.read / integrations.manage; support platform roles",
    tenantSafety: "Support mode tenant-scoped triage",
    tests: [
      "tests/unit/integration-health-recovery-era19.test.ts",
      "tests/unit/integration-health-smoke-artifacts-era19.test.ts",
    ],
    goldenPathPhaseId: "integrations",
    launchWizardStepId: "integrations",
    briefingEntry: "/dashboard/today → integration tile",
    e2eState: "pilot_manual",
    blocker: "P0 channel/SSO smokes SKIPPED — honest SKIPPED states shown",
    nextAction: "Follow recovery checklist; run P0 smokes after ops vault",
  },
  {
    id: "support_impersonation_audit",
    label: "Support impersonation → audit trail",
    actor: "support admin",
    uiPath: ["/platform/support", "/dashboard/support"],
    services: [
      "services/platform/platform-support-service.ts",
      "services/support/support-service.ts",
    ],
    rbac: "Platform support roles; impersonation audited",
    tenantSafety: "Session-bound workspace; audit on impersonate",
    tests: ["tests/unit/platform-support-inbox-focus-era18.test.ts", "tests/unit/support-tickets-actions-rbac.test.ts"],
    goldenPathPhaseId: null,
    launchWizardStepId: null,
    briefingEntry: null,
    e2eState: "pilot_manual",
    blocker: "Pilot support boundaries doc required before kickoff",
    nextAction: "Tabletop support + impersonation drill Week 2",
  },
] as const;

export function getEra20OperatorWorkflowProof(
  id: Era20OperatorWorkflowProofId,
): Era20OperatorWorkflowProofRow | undefined {
  return ERA20_OPERATOR_GOLDEN_PATH_WORKFLOWS.find((row) => row.id === id);
}

export function listEra20WorkflowsForGoldenPathPhase(
  phaseId: string,
): readonly Era20OperatorWorkflowProofRow[] {
  return ERA20_OPERATOR_GOLDEN_PATH_WORKFLOWS.filter((row) => row.goldenPathPhaseId === phaseId);
}

export function buildEra20GoldenPathProofSummary(): {
  policyId: typeof ERA20_OPERATOR_GOLDEN_PATH_PROOF_POLICY_ID;
  workflowCount: number;
  ciBackedCount: number;
  stagingManualCount: number;
  launchWizardStepsMapped: number;
} {
  return {
    policyId: ERA20_OPERATOR_GOLDEN_PATH_PROOF_POLICY_ID,
    workflowCount: ERA20_OPERATOR_GOLDEN_PATH_WORKFLOWS.length,
    ciBackedCount: ERA20_OPERATOR_GOLDEN_PATH_WORKFLOWS.filter((row) => row.e2eState === "real_ci")
      .length,
    stagingManualCount: ERA20_OPERATOR_GOLDEN_PATH_WORKFLOWS.filter(
      (row) => row.e2eState === "staging_manual",
    ).length,
    launchWizardStepsMapped: Object.keys(ERA20_LAUNCH_WIZARD_GOLDEN_PATH_PHASE_BY_STEP).length,
  };
}
