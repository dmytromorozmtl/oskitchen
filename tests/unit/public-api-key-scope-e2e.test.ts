import { describe, expect, it } from "vitest";

import {
  PUBLIC_API_KEY_SCOPE_ALLOW_CASES,
  PUBLIC_API_KEY_SCOPE_DENIAL_CASES,
  PUBLIC_API_KEY_SCOPE_E2E_POLICY_ID,
  PUBLIC_API_V1_BASE_PATH,
  highRiskPublicApiWriteScopes,
  isPublicApiScopeForbiddenStatus,
  publicApiPathForResource,
  requiredScopeForDenialCase,
} from "@/lib/api-public/public-api-key-scope-e2e-policy";
import { apiKeyHasScope } from "@/lib/api-public/public-api-scopes";

describe("public API key scope E2E policy (QA-26)", () => {
  it("exports policy id, base path, and denial matrix", () => {
    expect(PUBLIC_API_KEY_SCOPE_E2E_POLICY_ID).toBe("public-api-key-scope-e2e-v1");
    expect(PUBLIC_API_V1_BASE_PATH).toBe("/api/public/v1");
    expect(PUBLIC_API_KEY_SCOPE_DENIAL_CASES).toHaveLength(3);
    expect(PUBLIC_API_KEY_SCOPE_ALLOW_CASES).toHaveLength(3);
    expect(publicApiPathForResource("webhooks")).toBe("/api/public/v1/webhooks");
  });

  it("flags high-risk write scopes for pen-test PT-05", () => {
    expect(highRiskPublicApiWriteScopes()).toEqual(
      expect.arrayContaining(["orders:write", "webhooks:receive"]),
    );
    expect(isPublicApiScopeForbiddenStatus(403)).toBe(true);
  });

  it("denial matrix matches route scope requirements", () => {
    for (const denialCase of PUBLIC_API_KEY_SCOPE_DENIAL_CASES) {
      expect(requiredScopeForDenialCase(denialCase)).toBe(denialCase.requiredScope);
      expect(apiKeyHasScope(denialCase.grantedScopes, denialCase.requiredScope)).toBe(false);
    }
  });

  it("allow matrix grants required scopes", () => {
    for (const allowCase of PUBLIC_API_KEY_SCOPE_ALLOW_CASES) {
      expect(apiKeyHasScope(allowCase.grantedScopes, allowCase.requiredScope)).toBe(true);
    }
  });
});
