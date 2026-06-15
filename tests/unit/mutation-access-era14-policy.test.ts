import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { DOMAIN_MUTATION_HELPERS } from "@/lib/permissions/domain-mutation-registry";
import {
  findRegistryHelpersMissingRequireMutationPermission,
  findRegistryWave4DenialAuditGaps,
  findScopedHelpersMissingRequireMutationPermission,
  MUTATION_ACCESS_ERA14_POLICY_ID,
  MUTATION_ACCESS_ERA14_SCOPED_ACCESS_HELPERS,
  registryHelperCount,
} from "@/lib/permissions/mutation-access-era14-policy";
import { RBAC_WAVE4_ERA9_GUARDED_SURFACES } from "@/lib/security/rbac-wave4-era9-policy";

const ROOT = process.cwd();

function readSource(relativeModule: string): string {
  return readFileSync(join(ROOT, relativeModule), "utf8");
}

describe("mutation access era14 policy", () => {
  it("locks era14 mutation access consolidation recert policy id", () => {
    expect(MUTATION_ACCESS_ERA14_POLICY_ID).toBe(
      "era14-mutation-access-consolidation-recert-v1",
    );
    expect(registryHelperCount()).toBeGreaterThanOrEqual(15);
  });

  it("registry canonical helpers delegate to requireMutationPermission", () => {
    const gaps = findRegistryHelpersMissingRequireMutationPermission(readSource);
    expect(gaps).toEqual([]);
  });

  it("wave4 registry helpers with auditsDenials use logDomainMutationDenied", () => {
    const gaps = findRegistryWave4DenialAuditGaps(readSource);
    expect(gaps).toEqual([]);
  });

  it("scoped access helpers outside registry still anchor on requireMutationPermission when canonical", () => {
    const gaps = findScopedHelpersMissingRequireMutationPermission(readSource);
    expect(gaps).toEqual([]);
    for (const helper of MUTATION_ACCESS_ERA14_SCOPED_ACCESS_HELPERS) {
      expect(readSource(helper.module)).toContain(helper.entrypoint);
    }
  });

  it("keeps era9 wave4 guarded action surfaces on disk with guard markers", () => {
    for (const surface of RBAC_WAVE4_ERA9_GUARDED_SURFACES) {
      const source = readSource(surface.actionPath);
      for (const marker of surface.guardMarkers) {
        expect(source, `${surface.actionPath} missing ${marker}`).toContain(marker);
      }
    }
  });

  it("documents production calendar in registry after era11 recert", () => {
    const entry = DOMAIN_MUTATION_HELPERS.find((h) => h.id === "production_calendar");
    expect(entry?.backing).toEqual({
      kind: "canonical",
      permissions: ["production.manage"],
    });
  });
});
