import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  DOMAIN_MUTATION_HELPERS,
  DOMAIN_MUTATION_WAVE4_HELPER_IDS,
  getDocumentedMutationException,
} from "@/lib/permissions/domain-mutation-registry";
import { MUTATION_ACCESS_POLICY_ID } from "@/lib/permissions/mutation-access-policy";

const ROOT = process.cwd();

describe("domain mutation registry", () => {
  it("locks era4 consolidation policy id", () => {
    expect(MUTATION_ACCESS_POLICY_ID).toBe("era4-mutation-access-consolidation-v1");
  });

  it("lists every registry module on disk", () => {
    for (const entry of DOMAIN_MUTATION_HELPERS) {
      expect(existsSync(join(ROOT, entry.module)), entry.id).toBe(true);
    }
  });

  it("wave4 canonical helpers delegate to requireMutationPermission", () => {
    const wave4Canonical = ["routes_delivery", "demo_workspace", "restaurant_tables"];
    for (const id of wave4Canonical) {
      const entry = DOMAIN_MUTATION_HELPERS.find((h) => h.id === id);
      expect(entry?.era4Wave).toBe("wave4");
      const source = readFileSync(join(ROOT, entry!.module), "utf8");
      expect(source).toContain("requireMutationPermission");
      expect(source).toContain("logDomainMutationDenied");
    }
  });

  it("registers production calendar inline wave4 gate (era11 recert)", () => {
    const entry = DOMAIN_MUTATION_HELPERS.find((h) => h.id === "production_calendar");
    expect(entry?.era4Wave).toBe("wave4");
    const source = readFileSync(join(ROOT, entry!.module), "utf8");
    expect(source).toContain("requireMutationPermission");
    expect(source).toContain("updatePlanTaskStatusAction");
  });

  it("documents copilot and feedback exceptions", () => {
    expect(getDocumentedMutationException("copilot_capability_matrix")?.module).toContain(
      "copilot",
    );
    expect(getDocumentedMutationException("feedback_session_only")?.module).toContain("feedback");
    expect(DOMAIN_MUTATION_WAVE4_HELPER_IDS).toContain("copilot");
    expect(DOMAIN_MUTATION_WAVE4_HELPER_IDS).toContain("feedback_submit");
  });

  it("core entrypoint remains requireMutationPermission", () => {
    const core = DOMAIN_MUTATION_HELPERS.find((h) => h.id === "core_mutation_permission");
    expect(core?.entrypoint).toBe("requireMutationPermission");
  });
});
