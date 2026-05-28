import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_SSO_R2_RUNTIME_ERA16_AUDIT_ACTIONS,
  ENTERPRISE_SSO_R2_RUNTIME_ERA16_CALLBACK_QUERY_PARAM,
  ENTERPRISE_SSO_R2_RUNTIME_ERA16_EXTENDS_POLICIES,
  ENTERPRISE_SSO_R2_RUNTIME_ERA16_FORBIDDEN_DELIVERY_CLAIMS,
  ENTERPRISE_SSO_R2_RUNTIME_ERA16_POLICY_ID,
  ENTERPRISE_SSO_R2_RUNTIME_ERA16_RUNTIME_MODULES,
  ENTERPRISE_SSO_R2_RUNTIME_ERA16_SSO_DELIVERY_STATUS,
} from "@/lib/enterprise/enterprise-sso-r2-runtime-era16-policy";

describe("enterprise SSO R2 runtime era16 policy", () => {
  it("locks runtime callback policy id and delivery posture", () => {
    expect(ENTERPRISE_SSO_R2_RUNTIME_ERA16_POLICY_ID).toBe(
      "era16-enterprise-sso-r2-runtime-v1",
    );
    expect(ENTERPRISE_SSO_R2_RUNTIME_ERA16_SSO_DELIVERY_STATUS).toBe("pilot_foundation");
    expect(ENTERPRISE_SSO_R2_RUNTIME_ERA16_CALLBACK_QUERY_PARAM).toBe("sso_workspace_id");
  });

  it("extends schema and pilot policies", () => {
    expect(ENTERPRISE_SSO_R2_RUNTIME_ERA16_EXTENDS_POLICIES).toContain(
      "era16-enterprise-sso-r2-schema-v1",
    );
    expect(ENTERPRISE_SSO_R2_RUNTIME_ERA16_EXTENDS_POLICIES).toContain(
      "era16-enterprise-sso-r2-pilot-v1",
    );
  });

  it("documents runtime modules and audit actions without forbidden claims", () => {
    expect(ENTERPRISE_SSO_R2_RUNTIME_ERA16_RUNTIME_MODULES).toContain(
      "lib/enterprise/workspace-sso-runtime-adapter.ts",
    );
    expect(ENTERPRISE_SSO_R2_RUNTIME_ERA16_AUDIT_ACTIONS).toEqual([
      "sso.login_success",
      "sso.login_denied",
    ]);
    for (const forbidden of ENTERPRISE_SSO_R2_RUNTIME_ERA16_FORBIDDEN_DELIVERY_CLAIMS) {
      expect(forbidden.toLowerCase()).not.toContain("pilot_foundation");
    }
  });
});
