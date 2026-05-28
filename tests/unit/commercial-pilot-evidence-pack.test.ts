import { describe, expect, it } from "vitest";

import {
  COMMERCIAL_PILOT_ALLOWED_FEATURES,
  COMMERCIAL_PILOT_ESCALATION_TIERS,
  COMMERCIAL_PILOT_ROLE_CHECKLISTS,
  COMMERCIAL_PILOT_ROLLBACK_STEPS,
  evaluateCommercialPilotGoNoGo,
  getCommercialPilotRoleChecklist,
  validateCommercialPilotEvidencePackStructure,
} from "@/lib/commercial/commercial-pilot-evidence-pack";
import { COMMERCIAL_PILOT_EVIDENCE_ERA16_ROLES } from "@/lib/commercial/commercial-pilot-evidence-pack-era16-policy";

describe("commercial pilot evidence pack", () => {
  it("defines checklists for all pilot roles", () => {
    for (const role of COMMERCIAL_PILOT_EVIDENCE_ERA16_ROLES) {
      const checklist = getCommercialPilotRoleChecklist(role);
      expect(checklist, role).toBeTruthy();
      expect(checklist!.items.length).toBeGreaterThan(0);
    }
    expect(COMMERCIAL_PILOT_ROLE_CHECKLISTS.length).toBe(5);
  });

  it("returns GO when all gates pass", () => {
    const result = evaluateCommercialPilotGoNoGo({
      tier0Pass: true,
      tier1Pass: true,
      tier2Pass: true,
      tier3Pass: true,
      roleChecklistsComplete: true,
      forbiddenClaimsInContract: false,
      stagingUrl: "https://staging.example.com",
      commitSha: "abc123",
    });
    expect(result.decision).toBe("GO");
    expect(result.blockers).toEqual([]);
  });

  it("returns NO-GO when tier 0 fails or forbidden claims present", () => {
    expect(
      evaluateCommercialPilotGoNoGo({
        tier0Pass: false,
        tier1Pass: true,
        tier2Pass: true,
        roleChecklistsComplete: true,
        forbiddenClaimsInContract: false,
      }).decision,
    ).toBe("NO-GO");

    expect(
      evaluateCommercialPilotGoNoGo({
        tier0Pass: true,
        tier1Pass: true,
        tier2Pass: true,
        roleChecklistsComplete: true,
        forbiddenClaimsInContract: true,
      }).blockers,
    ).toContain("Contract or marketing copy contains forbidden pilot claims");
  });

  it("returns CONDITIONAL when only warnings remain", () => {
    const result = evaluateCommercialPilotGoNoGo({
      tier0Pass: true,
      tier1Pass: true,
      tier2Pass: true,
      roleChecklistsComplete: true,
      forbiddenClaimsInContract: false,
    });
    expect(result.decision).toBe("CONDITIONAL");
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("validates evidence pack structure", () => {
    expect(validateCommercialPilotEvidencePackStructure().ok).toBe(true);
    expect(COMMERCIAL_PILOT_ALLOWED_FEATURES.length).toBeGreaterThanOrEqual(8);
    expect(COMMERCIAL_PILOT_ROLLBACK_STEPS.length).toBeGreaterThanOrEqual(5);
    expect(COMMERCIAL_PILOT_ESCALATION_TIERS.map((t) => t.severity)).toEqual(["P0", "P1", "P2"]);
  });
});
