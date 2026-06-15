import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_IDENTITY_ANNUAL_REVIEW_SECTION,
  ENTERPRISE_IDENTITY_DELIVERY_DECISION,
  ENTERPRISE_IDENTITY_FORBIDDEN_DELIVERY_CLAIMS,
  ENTERPRISE_IDENTITY_PROCUREMENT_DOC,
  ENTERPRISE_IDENTITY_ROADMAP_POLICY_ID,
  ENTERPRISE_SCIM_DELIVERY_STATUS,
  ENTERPRISE_SOC2_TYPE2_STATUS,
  ENTERPRISE_SSO_DELIVERY_STATUS,
} from "@/lib/enterprise/enterprise-identity-roadmap-policy";

const ROOT = process.cwd();

describe("enterprise identity roadmap policy", () => {
  it("locks era6 annual review decision as roadmap-only", () => {
    expect(ENTERPRISE_IDENTITY_ROADMAP_POLICY_ID).toBe("era6-enterprise-identity-roadmap-v1");
    expect(ENTERPRISE_IDENTITY_DELIVERY_DECISION).toBe("roadmap_only");
    expect(ENTERPRISE_SSO_DELIVERY_STATUS).toBe("not_implemented");
    expect(ENTERPRISE_SCIM_DELIVERY_STATUS).toBe("not_implemented");
    expect(ENTERPRISE_SOC2_TYPE2_STATUS).toBe("not_certified");
  });

  it("documents annual review in procurement pack without forbidden delivery claims", () => {
    const content = readFileSync(
      join(ROOT, ENTERPRISE_IDENTITY_PROCUREMENT_DOC),
      "utf8",
    );
    expect(content).toContain(`## ${ENTERPRISE_IDENTITY_ANNUAL_REVIEW_SECTION}`);
    expect(content).toContain(ENTERPRISE_IDENTITY_ROADMAP_POLICY_ID);
    for (const phrase of ENTERPRISE_IDENTITY_FORBIDDEN_DELIVERY_CLAIMS) {
      expect(content, `forbidden: ${phrase}`).not.toContain(phrase);
    }
  });
});
