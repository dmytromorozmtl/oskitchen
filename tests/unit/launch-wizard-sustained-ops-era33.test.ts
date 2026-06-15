import { describe, expect, it } from "vitest";

import { buildSustainedOperationalExcellenceUiSlice } from "@/lib/commercial/sustained-operational-excellence-ui-era21";
import {
  buildLaunchWizardSustainedOpsSlice,
  launchWizardSustainedOpsHref,
} from "@/lib/launch-wizard/launch-wizard-sustained-ops-era33";

const marketLeaderCompleteEnv = {
  PILOT_WEEK1_TTV_HOURS: "6",
  PILOT_WEEK1_FIRST_ORDER_ID: "ord_123",
  PILOT_WEEK1_INTEGRATION_HEALTH_REVIEWED: "1",
  PILOT_WEEK1_POS_CLOSEOUT_STATUS: "pass",
  PILOT_WEEK1_REPORTS_WEEKLY_EXPORT: "1",
  MONTH2_INVESTOR_FOUNDER_SIGNOFF: "1",
  MONTH2_GTM_GHOST_KITCHEN_LANDING_REVIEWED: "1",
  MONTH2_GTM_MEAL_PREP_LANDING_REVIEWED: "1",
  PILOT_CASE_STUDY_CUSTOMER_APPROVAL: "signed",
  SCALE_PER_CUSTOMER_GO_ISOLATION: "1",
  SCALE_SOC2_READINESS_TRACK_REVIEWED: "1",
  SCALE_SSO_PRODUCTION_STATUS: "pass",
  SCALE_RESILIENCE_DRILLS_ATTESTED: "1",
  SCALE_DATA_ROOM_INDEX_PUBLISHED: "1",
  SERIES_A_DATA_ROOM_BUNDLE_PUBLISHED: "1",
  SERIES_A_PARTNER_ONEPAGER_REVIEWED: "1",
  SERIES_A_MULTI_REGION_PLAYBOOK_DRAFTED: "1",
  SERIES_A_MARKETING_CLAIMS_STRICT_REVIEWED: "1",
  SERIES_A_CS_PLAYBOOK_REVIEWED: "1",
  MARKET_LEADER_CATEGORY_NARRATIVE_REVIEWED: "1",
  MARKET_LEADER_MOAT_DECK_REVIEWED: "1",
  MARKET_LEADER_ANALYST_KIT_PUBLISHED: "1",
  MARKET_LEADER_EXPANSION_MOTION_REVIEWED: "1",
};

describe("launch-wizard-sustained-ops-era33", () => {
  it("builds slice when sustained ops train active with integrity flags", () => {
    const sustainedOps = buildSustainedOperationalExcellenceUiSlice({
      goNoGoSummary: {
        version: "era17-pilot-gono-go-v1",
        runAt: new Date().toISOString(),
        decision: "GO",
        blockers: [],
        warnings: [],
        customerExecutionStatus: "recorded",
        customerName: "Acme",
        loiSignedDate: "2026-06-01",
        prospectExecutionStatus: "none",
        prospectName: null,
        icpQualification: { qualified: true, missingCriteria: [], disqualifiers: [] },
        evidenceGates: [
          { id: "tier0", label: "t0", pass: true, reason: "ok" },
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
      },
      p0ProofStatus: "proof_passed",
      tier2ProofStatus: "proof_passed",
      env: { ...marketLeaderCompleteEnv, SUSTAINED_OPS_DAILY_CADENCE_ATTESTED: "1" },
    });
    const slice = buildLaunchWizardSustainedOpsSlice(sustainedOps);
    expect(slice).not.toBeNull();
    expect(slice!.progressLabel).toContain("cadences");
    expect(launchWizardSustainedOpsHref()).toContain("#launch-wizard-sustained-ops");
  });
});
