import { describe, expect, it } from "vitest";

import {
  auditObjectionHandlingDoc,
  getObjectionById,
  lintObjectionHandlingCopy,
  listObjectionHandlingCoreIds,
  OBJECTION_HANDLING_CORE,
  OBJECTION_HANDLING_FRAMEWORK,
  OBJECTION_HANDLING_POLICY_ID,
} from "@/lib/marketing/objection-handling-policy";

describe("objection handling policy (MKT-23)", () => {
  it("locks MKT-23 policy id and twelve core objections", () => {
    expect(OBJECTION_HANDLING_POLICY_ID).toBe("objection-handling-mkt23-v1");
    expect(OBJECTION_HANDLING_CORE).toHaveLength(12);
    expect(OBJECTION_HANDLING_FRAMEWORK).toBe("LAER");
    expect(listObjectionHandlingCoreIds()).toContain("O5");
  });

  it("maps O5 integrations-skipped objection", () => {
    const o5 = getObjectionById("O5");
    expect(o5?.slug).toBe("integrations-skipped");
    expect(o5?.label).toContain("SKIPPED");
  });

  it("passes audit on canonical objection handling doc", () => {
    const audit = auditObjectionHandlingDoc();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
    expect(audit.objectionCount).toBe(12);
  });

  it("flags forbidden objection override responses", () => {
    const result = lintObjectionHandlingCopy(
      "Don't worry — we have thousands of customers and all integrations are live with guaranteed ROI in 90 days.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest objection responses", () => {
    const result = lintObjectionHandlingCopy(
      "SKIPPED means staging smoke not run yet — design partner program with honest Integration Health.",
    );
    expect(result.passed).toBe(true);
  });
});
