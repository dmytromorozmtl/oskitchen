import { describe, expect, it } from "vitest";

import {
  P0_STAGING_PROOF_UNBLOCK_ERA17_CHILD_SMOKES,
  P0_STAGING_PROOF_UNBLOCK_ERA17_ENV_VAR_CATALOG,
  P0_STAGING_PROOF_UNBLOCK_ERA17_ENV_VAR_KEYS,
  P0_STAGING_PROOF_UNBLOCK_ERA17_FORBIDDEN_CLAIMS,
  P0_STAGING_PROOF_UNBLOCK_ERA17_OPS_CHECKLIST_DOC,
  P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID,
  P0_STAGING_PROOF_UNBLOCK_ERA17_PROOF_STATUS,
  P0_STAGING_PROOF_UNBLOCK_ERA17_UNBLOCK_STEPS,
} from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";

describe("p0 staging proof unblock era17 policy", () => {
  it("locks era17 p0 staging proof unblock policy id", () => {
    expect(P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID).toBe(
      "era17-p0-staging-proof-unblock-v1",
    );
  });

  it("does not claim p0 proof passed without child artifacts", () => {
    expect(P0_STAGING_PROOF_UNBLOCK_ERA17_PROOF_STATUS).toBe("awaiting_ops_credentials");
    expect(P0_STAGING_PROOF_UNBLOCK_ERA17_FORBIDDEN_CLAIMS).toContain(
      "p0 staging proof passed without child artifacts",
    );
  });

  it("orchestrates the three P0 staging smokes in priority order", () => {
    expect(P0_STAGING_PROOF_UNBLOCK_ERA17_CHILD_SMOKES).toEqual([
      "smoke:enterprise-sso-idp-staging",
      "smoke:staging-workflows-first-green",
      "smoke:woo-shopify-live",
    ]);
    expect(P0_STAGING_PROOF_UNBLOCK_ERA17_UNBLOCK_STEPS.length).toBeGreaterThanOrEqual(6);
  });

  it("catalogs eleven prerequisite env vars for ops vault configuration", () => {
    expect(P0_STAGING_PROOF_UNBLOCK_ERA17_ENV_VAR_CATALOG).toHaveLength(11);
    expect(P0_STAGING_PROOF_UNBLOCK_ERA17_ENV_VAR_KEYS).toEqual([
      "E2E_STAGING_BASE_URL",
      "E2E_LOGIN_EMAIL",
      "E2E_LOGIN_PASSWORD",
      "SSO_STAGING_WORKSPACE_ID",
      "SSO_STAGING_IDP_VENDOR",
      "SSO_STAGING_ALLOWED_DOMAIN",
      "SSO_STAGING_TEST_EMAIL",
      "SSO_STAGING_SUPABASE_PROVIDER_REF",
      "DATABASE_URL",
      "ENCRYPTION_KEY",
      "CHANNEL_SMOKE_OWNER_EMAIL",
    ]);
    expect(P0_STAGING_PROOF_UNBLOCK_ERA17_OPS_CHECKLIST_DOC).toBe(
      "docs/era18-p0-staging-proof-ops-checklist.md",
    );
  });
});
