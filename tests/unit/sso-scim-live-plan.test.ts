import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const PLAN_PATH = join(process.cwd(), "docs/sso-scim-live-plan.md");
const SSO_STAGING_PATH = join(process.cwd(), "docs/enterprise-sso-idp-staging-smoke-plan.md");
const SCIM_RFC_PATH = join(process.cwd(), "docs/scim-provisioning-rfc.md");
const ENTERPRISE_PATH = join(process.cwd(), "docs/enterprise-mvp-spec.md");

describe("sso scim live plan doc", () => {
  it("exists with Okta, Entra, SCIM, and enterprise guide", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    expect(doc).toContain("# SSO + SCIM LIVE plan — OS Kitchen");
    expect(doc).toContain("sso-scim-live-plan-v1");
    expect(doc).toContain("## Okta setup");
    expect(doc).toContain("Entra ID");
    expect(doc).toContain("Azure AD");
    expect(doc).toContain("## SCIM provisioning plan");
    expect(doc).toContain("## Enterprise administrator guide");
    expect(doc).toContain("## LIVE definition of done");
  });

  it("links staging smoke plan and SCIM RFC", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    const staging = readFileSync(SSO_STAGING_PATH, "utf8");
    const scim = readFileSync(SCIM_RFC_PATH, "utf8");
    expect(doc).toContain("enterprise-sso-idp-staging-smoke-plan.md");
    expect(doc).toContain("scim-provisioning-rfc.md");
    expect(staging).toContain("OKTA");
    expect(scim).toContain("not_implemented");
  });

  it("forbids production SSO/SCIM claims before LIVE gates", () => {
    const doc = readFileSync(PLAN_PATH, "utf8");
    const enterprise = readFileSync(ENTERPRISE_PATH, "utf8");
    expect(doc).toContain("Forbidden");
    expect(doc).toContain("not_implemented");
    expect(enterprise).toContain("SCIM provisioning");
  });
});
