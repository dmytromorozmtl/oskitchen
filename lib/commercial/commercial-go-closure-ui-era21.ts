/**
 * Commercial GO closure UI slice — Launch Wizard, Owner Briefing, Platform ops.
 */
import {
  resolveCommercialGoClosureMilestoneFromPhaseStatuses,
  type CommercialGoClosureMilestone,
} from "@/lib/commercial/commercial-go-closure-post-tier2-orchestrator-era21";
import {
  buildCommercialGoClosurePhaseStatuses,
  COMMERCIAL_GO_CLOSURE_BLOCKER_PLAYBOOK_DOC,
  COMMERCIAL_GO_CLOSURE_STEP3_DOC,
  formatCommercialGoClosurePhaseBlockerDetail,
  resolveCommercialGoClosurePrerequisites,
  resolveNextIncompleteCommercialGoClosurePhase,
  type CommercialGoClosurePhaseStatus,
} from "@/lib/commercial/commercial-go-closure-phases-era21";
import { PILOT_GONOGO_SUMMARY_ARTIFACT_PATH } from "@/lib/commercial/commercial-go-closure-phases-era21";
import { evaluatePilotGoNoGoIntegrity } from "@/lib/commercial/pilot-gono-go-integrity-era28";
import type { PilotGoNoGoSummary } from "@/lib/commercial/pilot-gono-go-summary";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";

export const COMMERCIAL_GO_CLOSURE_UI_ERA21_POLICY_ID = "era21-commercial-go-closure-ui-v1" as const;

export type CommercialGoClosureUiSlice = {
  policyId: typeof COMMERCIAL_GO_CLOSURE_UI_ERA21_POLICY_ID;
  visible: boolean;
  blocked: boolean;
  decision: string | null;
  customerExecutionStatus: string | null;
  phases: readonly CommercialGoClosurePhaseStatus[];
  completedPhaseCount: number;
  step3Doc: typeof COMMERCIAL_GO_CLOSURE_STEP3_DOC;
  blockerPlaybookDoc: typeof COMMERCIAL_GO_CLOSURE_BLOCKER_PLAYBOOK_DOC;
  validateCommand: string;
  exportTemplateCommand: string;
  syncProgressReportCommand: string;
  postTier2OrchestratorCommand: string;
  commercialGateExecutionCommand: string;
  commercialGateExecutionArtifact: string;
  exportReadinessChecklistCommand: string;
  validateTier2GateCommand: string;
  validateTier2IntegrityCommand: string;
  integrityValidateCommand: string;
  syncIntegrityBaselineCommand: string;
  orchestratorCommand: string;
  forbiddenClaimsCommand: string;
  goIntegrityPassed: boolean;
  goIntegrityFailed: boolean;
  goClosureMilestone: CommercialGoClosureMilestone;
  implementationHref: string;
  launchWizardHref: string;
  nextPhase: CommercialGoClosurePhaseStatus | null;
  nextPhaseDetail: string | null;
  goNoGoArtifact: typeof PILOT_GONOGO_SUMMARY_ARTIFACT_PATH;
};

export function buildCommercialGoClosureUiSlice(input: {
  p0ProofStatus: string | null;
  tier2ProofStatus: string | null;
  goNoGoSummary: PilotGoNoGoSummary | null;
}): CommercialGoClosureUiSlice | null {
  const prerequisites = resolveCommercialGoClosurePrerequisites({
    p0ProofStatus: input.p0ProofStatus,
    tier2ProofStatus: input.tier2ProofStatus,
  });
  if (!prerequisites.prerequisitesComplete) return null;

  const goIntegrity = evaluatePilotGoNoGoIntegrity(process.cwd(), {
    artifactOverride: input.goNoGoSummary,
    p0ProofStatusOverride: input.p0ProofStatus,
    tier2ProofStatusOverride: input.tier2ProofStatus,
  });

  const decision = input.goNoGoSummary?.decision ?? null;
  const goHonest = decision === "GO" && goIntegrity.integrityPassed;
  const blocked = !goHonest;
  const goIntegrityFailed = decision === "GO" && !goIntegrity.integrityPassed;

  if (!blocked) return null;

  const phases = buildCommercialGoClosurePhaseStatuses({
    prerequisites,
    goNoGoSummary: input.goNoGoSummary,
  });
  const completedPhaseCount = phases.filter((p) => p.complete).length;
  const nextPhase = resolveNextIncompleteCommercialGoClosurePhase(phases);
  const nextPhaseDetail = nextPhase
    ? formatCommercialGoClosurePhaseBlockerDetail(nextPhase)
    : null;
  const goClosureMilestone = resolveCommercialGoClosureMilestoneFromPhaseStatuses(phases, {
    prerequisitesComplete: true,
    decision,
  });

  return {
    policyId: COMMERCIAL_GO_CLOSURE_UI_ERA21_POLICY_ID,
    visible: true,
    blocked,
    decision,
    customerExecutionStatus: input.goNoGoSummary?.customerExecutionStatus ?? null,
    phases,
    completedPhaseCount,
    step3Doc: COMMERCIAL_GO_CLOSURE_STEP3_DOC,
    blockerPlaybookDoc: COMMERCIAL_GO_CLOSURE_BLOCKER_PLAYBOOK_DOC,
    validateCommand: "npm run ops:validate-commercial-go-closure-env",
    exportTemplateCommand: "npm run ops:export-commercial-go-closure-env-template -- --write",
    syncProgressReportCommand: "npm run ops:sync-commercial-go-closure-progress-report -- --write",
    postTier2OrchestratorCommand:
      "npm run ops:run-commercial-go-closure-post-tier2-orchestrator -- --write",
    commercialGateExecutionCommand: "npm run ops:run-commercial-gate-execution -- --write",
    commercialGateExecutionArtifact: "artifacts/commercial-gate-execution-summary.json",
    exportReadinessChecklistCommand:
      "npm run ops:export-commercial-go-closure-readiness-checklist -- --write",
    validateTier2GateCommand: "npm run ops:validate-tier2-golden-path-env -- --json",
    validateTier2IntegrityCommand:
      "npm run ops:validate-tier2-staging-golden-path-integrity -- --json",
    forbiddenClaimsCommand: "npm run smoke:pilot-forbidden-claims-enforcement",
    integrityValidateCommand: "npm run ops:validate-pilot-gono-go-integrity -- --json",
    syncIntegrityBaselineCommand: "npm run ops:sync-pilot-gono-go-integrity-baseline -- --write",
    goIntegrityPassed: goIntegrity.integrityPassed,
    goIntegrityFailed,
    goClosureMilestone,
    orchestratorCommand: "npm run smoke:pilot-gono-go",
    implementationHref: "/dashboard/implementation",
    launchWizardHref: `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}`,
    nextPhase,
    nextPhaseDetail,
    goNoGoArtifact: PILOT_GONOGO_SUMMARY_ARTIFACT_PATH,
  };
}

export function formatCommercialGoClosureProgressLabel(slice: CommercialGoClosureUiSlice): string {
  const decisionLabel = slice.decision ?? "not evaluated";
  return `Commercial GO ${slice.completedPhaseCount}/${slice.phases.length} phases · ${slice.goClosureMilestone.replaceAll("_", " ")} · ${decisionLabel}`;
}
