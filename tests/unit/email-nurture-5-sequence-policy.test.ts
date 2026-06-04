import { describe, expect, it } from "vitest";

import {
  auditEmailNurture5SequenceDoc,
  EMAIL_NURTURE_5_SEQUENCE_EMAILS,
  EMAIL_NURTURE_5_SEQUENCE_POLICY_ID,
  EMAIL_NURTURE_5_SEQUENCE_PRIMARY_CTA,
  lintEmailNurture5SequenceCopy,
  totalEmailNurture5SequenceSpanDays,
} from "@/lib/marketing/email-nurture-5-sequence-policy";

describe("email nurture 5-sequence policy (MKT-19)", () => {
  it("locks MKT-19 policy id and five-email inbound span", () => {
    expect(EMAIL_NURTURE_5_SEQUENCE_POLICY_ID).toBe("email-nurture-5-sequence-mkt19-v1");
    expect(EMAIL_NURTURE_5_SEQUENCE_EMAILS).toHaveLength(5);
    expect(totalEmailNurture5SequenceSpanDays()).toBe(14);
    expect(EMAIL_NURTURE_5_SEQUENCE_EMAILS[0]?.sendDay).toBe(0);
  });

  it("maps book-demo CTA with nurture UTM on email 5", () => {
    expect(EMAIL_NURTURE_5_SEQUENCE_PRIMARY_CTA.href).toContain("utm_medium=nurture");
    expect(EMAIL_NURTURE_5_SEQUENCE_PRIMARY_CTA.href).toContain("nurture_mkt19_e5");
  });

  it("passes audit on canonical nurture sequence doc", () => {
    const audit = auditEmailNurture5SequenceDoc();
    expect(audit.passed).toBe(true);
    expect(audit.missingHeadings).toEqual([]);
  });

  it("flags forbidden nurture copy claims", () => {
    const result = lintEmailNurture5SequenceCopy(
      "Trusted by thousands with guaranteed ROI — all integrations live and SOC 2 certified.",
    );
    expect(result.passed).toBe(false);
    expect(result.forbiddenHits.length).toBeGreaterThan(0);
  });

  it("allows honest inbound nurture copy", () => {
    const result = lintEmailNurture5SequenceCopy(
      "Design partner program open — BETA labels on integrations until staging smoke PASS.",
    );
    expect(result.passed).toBe(true);
  });
});
