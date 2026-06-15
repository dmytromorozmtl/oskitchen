import { describe, expect, it } from "vitest";

import {
  auditLoiTemplateWalkthroughDoc,
  getLoiTemplateWalkthroughStepById,
  lintLoiTemplateWalkthroughCopy,
  listLoiTemplateWalkthroughStepIds,
  LOI_DEFAULT_TERM_MONTHS,
  LOI_TEMPLATE_WALKTHROUGH_POLICY_ID,
  LOI_TEMPLATE_WALKTHROUGH_SKU,
  LOI_TEMPLATE_WALKTHROUGH_STEPS,
  totalLoiTemplateWalkthroughDurationSec,
} from "@/lib/marketing/loi-template-walkthrough-policy";

describe("LOI template walkthrough policy (MKT-28)", () => {
  it("locks MKT-28 policy id, SKU, and eight walkthrough steps", () => {
    expect(LOI_TEMPLATE_WALKTHROUGH_POLICY_ID).toBe(
      "loi-template-walkthrough-mkt28-v1",
    );
    expect(LOI_TEMPLATE_WALKTHROUGH_SKU).toBe("LOI-DP-001");
    expect(LOI_DEFAULT_TERM_MONTHS).toBe(3);
    expect(LOI_TEMPLATE_WALKTHROUGH_STEPS).toHaveLength(8);
    expect(listLoiTemplateWalkthroughStepIds()).toContain("W5");
  });

  it("maps W5 scope-limitations step with longest duration", () => {
    const w5 = getLoiTemplateWalkthroughStepById("W5");
    expect(w5?.slug).toBe("scope-limitations");
    expect(w5?.durationSec).toBe(300);
    expect(totalLoiTemplateWalkthroughDurationSec()).toBe(1260);
  });

  it("passes audit on canonical LOI template walkthrough doc", () => {
    const audit = auditLoiTemplateWalkthroughDoc();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
    expect(audit.stepCount).toBe(8);
    expect(audit.exhibitCount).toBe(3);
  });

  it("flags forbidden LOI walkthrough claims", () => {
    const result = lintLoiTemplateWalkthroughCopy(
      "We have thousands of customers and all integrations are live with binding production SLA and SOC 2 certified enterprise SSO.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest LOI walkthrough copy", () => {
    const result = lintLoiTemplateWalkthroughCopy(
      "Non-binding LOI-DP-001 design partner term with BETA modules and staging golden path before production traffic.",
    );
    expect(result.passed).toBe(true);
  });
});
