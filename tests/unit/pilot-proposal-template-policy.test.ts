import { describe, expect, it } from "vitest";

import {
  auditPilotProposalTemplateDoc,
  getPilotProposalSectionById,
  lintPilotProposalCopy,
  listPilotProposalSectionIds,
  PILOT_PROPOSAL_DURATION_DAYS,
  PILOT_PROPOSAL_SECTIONS,
  PILOT_PROPOSAL_SKUS,
  PILOT_PROPOSAL_TEMPLATE_POLICY_ID,
} from "@/lib/marketing/pilot-proposal-template-policy";

describe("pilot proposal template policy (MKT-24)", () => {
  it("locks MKT-24 policy id and ten proposal sections", () => {
    expect(PILOT_PROPOSAL_TEMPLATE_POLICY_ID).toBe("pilot-proposal-template-mkt24-v1");
    expect(PILOT_PROPOSAL_SECTIONS).toHaveLength(10);
    expect(PILOT_PROPOSAL_DURATION_DAYS).toBe(90);
    expect(listPilotProposalSectionIds()).toContain("P4");
  });

  it("maps P4 pilot-pricing section", () => {
    const p4 = getPilotProposalSectionById("P4");
    expect(p4?.slug).toBe("pilot-pricing");
    expect(PILOT_PROPOSAL_SKUS).toContain("LOI-DP-001");
    expect(PILOT_PROPOSAL_SKUS).toContain("PILOT-PLAT-90");
  });

  it("passes audit on canonical pilot proposal template doc", () => {
    const audit = auditPilotProposalTemplateDoc();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
    expect(audit.sectionCount).toBe(10);
    expect(audit.skuCount).toBe(PILOT_PROPOSAL_SKUS.length);
  });

  it("flags forbidden proposal claims", () => {
    const result = lintPilotProposalCopy(
      "We have thousands of customers with all integrations are live and guaranteed ROI in 90 days.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest pilot proposal copy", () => {
    const result = lintPilotProposalCopy(
      "Design partner LOI-DP-001 with honest BETA scope and Integration Health SKIPPED visibility.",
    );
    expect(result.passed).toBe(true);
  });
});
