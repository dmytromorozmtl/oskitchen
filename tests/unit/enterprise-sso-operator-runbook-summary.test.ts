import { describe, expect, it } from "vitest";

import {
  buildEnterpriseSsoOperatorRunbookSummary,
  resolveEnterpriseSsoOperatorProofStatus,
} from "@/lib/enterprise/enterprise-sso-operator-runbook-summary";

describe("enterprise SSO operator runbook summary", () => {
  it("passes when cert passes — operator runbook ready", () => {
    const summary = buildEnterpriseSsoOperatorRunbookSummary({ certPassed: true });
    expect(summary.overall).toBe("PASSED");
    expect(summary.ssoOperatorProofStatus).toBe("operator_runbook_ready");
    expect(summary.ssoDeliveryStatus).toBe("pilot_foundation");
  });

  it("fails when cert fails", () => {
    expect(resolveEnterpriseSsoOperatorProofStatus(false)).toBe("proof_failed_cert");
    const summary = buildEnterpriseSsoOperatorRunbookSummary({ certPassed: false });
    expect(summary.overall).toBe("FAILED");
  });
});
