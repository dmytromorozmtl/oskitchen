import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { ENTERPRISE_SSO_R2_SCHEMA_ERA16_MIGRATION } from "@/lib/enterprise/enterprise-sso-r2-schema-era16-policy";

describe("enterprise SSO R2 schema contract", () => {
  it("declares WorkspaceSsoSettings with workspace-scoped unique constraint and disabled default", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");
    expect(schema).toMatch(
      /model WorkspaceSsoSettings[\s\S]*?enabled\s+Boolean\s+@default\(false\)/,
    );
    expect(schema).toMatch(
      /model WorkspaceSsoSettings[\s\S]*?workspaceId\s+String\s+@unique/,
    );
    expect(schema).toMatch(
      /model WorkspaceSsoSettings[\s\S]*?pilotPhase\s+SsoPilotPhase\s+@default\(DISABLED\)/,
    );
  });

  it("declares SsoIdentity with workspace + idp subject uniqueness", () => {
    const schema = readFileSync(join(process.cwd(), "prisma/schema.prisma"), "utf8");
    expect(schema).toMatch(
      /model SsoIdentity[\s\S]*?@@unique\(\[workspaceId, idpVendor, idpSubject\]\)/,
    );
    expect(schema).toMatch(
      /model SsoIdentity[\s\S]*?@@unique\(\[workspaceId, userId, idpVendor\]\)/,
    );
  });

  it("migration creates workspace_sso_settings and sso_identities tables", () => {
    const migration = readFileSync(join(process.cwd(), ENTERPRISE_SSO_R2_SCHEMA_ERA16_MIGRATION), "utf8");
    expect(migration).toContain('CREATE TABLE "workspace_sso_settings"');
    expect(migration).toContain('CREATE TABLE "sso_identities"');
    expect(migration).toContain('"enabled" BOOLEAN NOT NULL DEFAULT false');
    expect(migration).toContain(
      "sso_identities_workspace_id_idp_vendor_idp_subject_key",
    );
  });
});
