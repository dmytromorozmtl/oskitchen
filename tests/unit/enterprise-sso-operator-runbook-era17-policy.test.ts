import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_AUDIT_EVENTS,
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_BACKLOG_ID,
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_FORBIDDEN_CLAIMS,
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_OPERATOR_DOC,
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_POLICY_ID,
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_PROOF_STATUS,
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_ROLLBACK_STEPS,
  ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_SSO_DELIVERY_STATUS,
} from "@/lib/enterprise/enterprise-sso-operator-runbook-era17-policy";

describe("enterprise SSO operator runbook era17 policy", () => {
  it("locks era17 enterprise SSO operator runbook policy id", () => {
    expect(ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_POLICY_ID).toBe(
      "era17-enterprise-sso-operator-runbook-v1",
    );
  });

  it("keeps pilot_foundation delivery status", () => {
    expect(ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_PROOF_STATUS).toBe("operator_runbook_ready");
    expect(ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_SSO_DELIVERY_STATUS).toBe("pilot_foundation");
    expect(ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_OPERATOR_DOC).toBe(
      "docs/enterprise-sso-operator-runbook-era17.md",
    );
    expect(ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_BACKLOG_ID).toBe("KOS-E17-039");
  });

  it("defines rollback steps audit events and forbidden claims", () => {
    expect(ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_ROLLBACK_STEPS.length).toBe(5);
    expect(ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_AUDIT_EVENTS).toContain("sso.login_success");
    expect(ENTERPRISE_SSO_OPERATOR_RUNBOOK_ERA17_FORBIDDEN_CLAIMS.length).toBeGreaterThan(3);
  });
});
