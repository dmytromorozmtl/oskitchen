import { describe, expect, it } from "vitest";

import {
  SCIM_USER_SCHEMA,
  SCIM_WORKSPACE_USER_EXTENSION,
} from "@/lib/scim/scim-constants";
import {
  buildServiceProviderConfig,
  buildScimResourceTypes,
  toScimUserResource,
} from "@/lib/scim/scim-resources";
import {
  generateScimBearerToken,
  hashScimBearerToken,
  verifyScimBearerToken,
} from "@/lib/scim/scim-token";
import {
  applyScimPatchToUserState,
  parseScimCreateUser,
  parseScimUserFilter,
} from "@/lib/scim/scim-validation";

describe("scim token helpers", () => {
  it("hashes and verifies bearer tokens", () => {
    const token = generateScimBearerToken();
    const hash = hashScimBearerToken(token);
    expect(verifyScimBearerToken(token, hash)).toBe(true);
    expect(verifyScimBearerToken("wrong", hash)).toBe(false);
  });
});

describe("scim validation", () => {
  it("parses create user payload with workspace role extension", () => {
    const parsed = parseScimCreateUser({
      schemas: [SCIM_USER_SCHEMA],
      userName: "Alex@Acme.com",
      externalId: "00u1abc",
      active: true,
      [SCIM_WORKSPACE_USER_EXTENSION]: { role: "ADMIN" },
    });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.input.userName).toBe("alex@acme.com");
      expect(parsed.input.role).toBe("ADMIN");
    }
  });

  it("rejects OWNER role assignment via extension", () => {
    const parsed = parseScimCreateUser({
      userName: "owner@acme.com",
      [SCIM_WORKSPACE_USER_EXTENSION]: { role: "OWNER" },
    });
    expect(parsed.ok).toBe(false);
  });

  it("parses userName filter", () => {
    expect(parseScimUserFilter('userName eq "Alex@Acme.com"')).toEqual({
      field: "userName",
      value: "alex@acme.com",
    });
  });

  it("blocks OWNER elevation in PATCH", () => {
    const result = applyScimPatchToUserState({
      active: true,
      role: "STAFF",
      operations: [
        {
          op: "replace",
          path: `${SCIM_WORKSPACE_USER_EXTENSION}:role`,
          value: "OWNER",
        },
      ],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.scimType).toBe("mutability");
      expect(result.status).toBe(403);
    }
  });

  it("applies active=false deactivation patch", () => {
    const result = applyScimPatchToUserState({
      active: true,
      role: "STAFF",
      operations: [{ op: "replace", path: "active", value: false }],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.active).toBe(false);
    }
  });
});

describe("scim discovery resources", () => {
  it("exposes RFC 7644 service provider config", () => {
    const config = buildServiceProviderConfig();
    expect(config.patch.supported).toBe(true);
    expect(config.authenticationSchemes[0]?.type).toBe("oauthbearertoken");
  });

  it("maps provisioned user to SCIM resource", () => {
    const now = new Date("2026-06-01T12:00:00.000Z");
    const resource = toScimUserResource({
      id: "550e8400-e29b-41d4-a716-446655440000",
      workspaceId: "ws-1",
      userId: "user-1",
      externalId: "00u1abc",
      userName: "alex@acme.com",
      active: true,
      role: "STAFF",
      idpSubject: null,
      lastSyncAt: now,
      createdAt: now,
      updatedAt: now,
      userProfile: { fullName: "Alex Rivera", email: "alex@acme.com" },
    });
    expect(resource.id).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(resource[SCIM_WORKSPACE_USER_EXTENSION]?.role).toBe("STAFF");
    expect(resource.meta.resourceType).toBe("User");
  });

  it("lists User and Group resource types", () => {
    const types = buildScimResourceTypes();
    expect(types.totalResults).toBe(2);
    expect(types.Resources.map((r) => r.id)).toEqual(["User", "Group"]);
  });
});
