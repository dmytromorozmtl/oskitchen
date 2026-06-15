import { describe, expect, it } from "vitest";

import {
  buildCapitalOAuthState,
  defaultCapitalOAuthScopes,
  intersectCapitalOAuthScopes,
  parseCapitalOAuthState,
} from "@/lib/commercial/capital-lender-oauth";
import { getCapitalPartnerByOAuthClientId } from "@/services/commercial/capital-lender-oauth-service";
import { resetCapitalPartnersConfigCache } from "@/lib/commercial/capital-partners";
import {
  partnerOAuthInstallationHasCapitalScope,
  validatePartnerOAuthScopes,
} from "@/lib/developer/partner-oauth-scopes";

describe("capital-lender-oauth helpers", () => {
  it("builds and parses capital OAuth state", () => {
    const referralId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
    const state = buildCapitalOAuthState(referralId);
    expect(parseCapitalOAuthState(state)).toBe(referralId);
    expect(parseCapitalOAuthState("invalid")).toBeNull();
  });

  it("validates capital OAuth scopes", () => {
    expect(validatePartnerOAuthScopes(defaultCapitalOAuthScopes())).toEqual([]);
    expect(
      partnerOAuthInstallationHasCapitalScope(
        defaultCapitalOAuthScopes(),
        "read:capital_attestation",
      ),
    ).toBe(true);
    expect(
      intersectCapitalOAuthScopes(["read:capital_attestation", "read:orders"]),
    ).toEqual(["read:capital_attestation"]);
  });

  it("maps oauth client ids to capital partners", () => {
    resetCapitalPartnersConfigCache();
    const partner = getCapitalPartnerByOAuthClientId("capital-flexcap-rbf-us");
    expect(partner?.slug).toBe("flexcap-rbf-us");
    expect(partner?.oauthEnabled).toBe(true);
  });
});
