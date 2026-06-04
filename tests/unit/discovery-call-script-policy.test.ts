import { describe, expect, it } from "vitest";

import {
  auditDiscoveryCallScriptDoc,
  DISCOVERY_CALL_BLOCKS,
  DISCOVERY_CALL_ICP_ADVANCE_THRESHOLD,
  DISCOVERY_CALL_LOI_CANDIDATE_THRESHOLD,
  DISCOVERY_CALL_ONE_LINE_OPENER,
  DISCOVERY_CALL_SCRIPT_POLICY_ID,
  DISCOVERY_CALL_QUALIFICATION_QUESTIONS,
  lintDiscoveryCallScriptCopy,
  scoreDiscoveryCallIcpAction,
  totalDiscoveryCallDurationMin,
} from "@/lib/marketing/discovery-call-script-policy";

describe("discovery call script policy (MKT-21)", () => {
  it("locks MKT-21 policy id and 30-minute five-block structure", () => {
    expect(DISCOVERY_CALL_SCRIPT_POLICY_ID).toBe("discovery-call-script-mkt21-v1");
    expect(DISCOVERY_CALL_BLOCKS).toHaveLength(5);
    expect(totalDiscoveryCallDurationMin()).toBe(30);
    expect(DISCOVERY_CALL_ONE_LINE_OPENER).toContain("honest beta scope");
  });

  it("defines seven ICP qualification questions and score thresholds", () => {
    expect(DISCOVERY_CALL_QUALIFICATION_QUESTIONS).toHaveLength(7);
    expect(DISCOVERY_CALL_ICP_ADVANCE_THRESHOLD).toBe(8);
    expect(DISCOVERY_CALL_LOI_CANDIDATE_THRESHOLD).toBe(12);
    expect(scoreDiscoveryCallIcpAction(13)).toBe("loi");
    expect(scoreDiscoveryCallIcpAction(9)).toBe("demo");
    expect(scoreDiscoveryCallIcpAction(5)).toBe("pass");
  });

  it("passes audit on canonical discovery call script doc", () => {
    const audit = auditDiscoveryCallScriptDoc();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
  });

  it("flags forbidden discovery call claims", () => {
    const result = lintDiscoveryCallScriptCopy(
      "We have thousands of customers, all integrations live, guaranteed ROI, and SOC 2 certified — Uber Eats official partner.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest design partner discovery copy", () => {
    const result = lintDiscoveryCallScriptCopy(
      "Pre-revenue design partner program — BETA and SKIPPED labels until staging smoke PASS.",
    );
    expect(result.passed).toBe(true);
  });
});
