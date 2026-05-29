import { describe, expect, it } from "vitest";

import { buildPilotWeek1ExecutionUiSlice } from "@/lib/commercial/pilot-week1-execution-ui-era21";
import {
  buildLaunchWizardPilotWeek1Slice,
  launchWizardPilotWeek1Href,
} from "@/lib/launch-wizard/launch-wizard-pilot-week1-era28";

const honestGo = {
  version: "era17-pilot-gono-go-v1" as const,
  runAt: new Date().toISOString(),
  decision: "GO" as const,
  blockers: [] as string[],
  warnings: [] as string[],
  customerExecutionStatus: "recorded" as const,
  customerName: "Acme",
  loiSignedDate: "2026-06-01",
  prospectExecutionStatus: "none" as const,
  prospectName: null,
  icpQualification: { qualified: true, missingCriteria: [], disqualifiers: [] },
  evidenceGates: [
    { id: "tier0", label: "t0", pass: true, reason: "ok" },
    { id: "tier1", label: "t1", pass: true, reason: "ok" },
    { id: "tier2", label: "t2", pass: true, reason: "ok" },
    { id: "icp_qualification", label: "icp", pass: true, reason: "ok" },
    { id: "forbidden_claims_enforcement", label: "fc", pass: true, reason: "ok" },
    { id: "p0_staging_proof", label: "p0", pass: true, reason: "ok" },
  ],
  evaluatorInput: {
    tier0Pass: true,
    tier1Pass: true,
    tier2Pass: true,
    tier3Pass: true,
    roleChecklistsComplete: true,
    forbiddenClaimsInContract: false,
    icpQualified: true,
    stagingUrl: "https://x.example.com",
    commitSha: "abc",
  },
};

describe("launch-wizard-pilot-week1-era28", () => {
  it("builds slice from week1 ui", () => {
    const week1 = buildPilotWeek1ExecutionUiSlice({
      goNoGoSummary: honestGo,
      p0ProofStatus: "proof_passed",
      tier2ProofStatus: "proof_passed",
    });
    const slice = buildLaunchWizardPilotWeek1Slice(week1);
    expect(slice?.integrityValidateCommand).toContain("validate-pilot-week1-execution-integrity");
    expect(launchWizardPilotWeek1Href()).toContain("#launch-wizard-pilot-week1");
  });
});
