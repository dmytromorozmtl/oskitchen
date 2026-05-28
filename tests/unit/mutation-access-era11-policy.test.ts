import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { getDomainMutationHelper } from "@/lib/permissions/domain-mutation-registry";
import {
  MUTATION_ACCESS_ERA11_INLINE_WAVE4_GATES,
  MUTATION_ACCESS_ERA11_POLICY_ID,
} from "@/lib/permissions/mutation-access-era11-policy";

const ROOT = process.cwd();

describe("mutation access era11 policy", () => {
  it("locks era11 mutation access recert policy id", () => {
    expect(MUTATION_ACCESS_ERA11_POLICY_ID).toBe("era11-mutation-access-recert-v1");
  });

  it("registers production calendar inline wave4 gate with status operation", () => {
    const entry = getDomainMutationHelper("production_calendar");
    expect(entry?.backing).toEqual({
      kind: "canonical",
      permissions: ["production.manage"],
    });
    const gate = MUTATION_ACCESS_ERA11_INLINE_WAVE4_GATES[0];
    expect(gate.operations).toContain("production_calendar.update_task_status");

    const source = readFileSync(join(ROOT, "actions/production-calendar.ts"), "utf8");
    expect(source).toContain("requireMutationPermission");
    expect(source).toContain("updatePlanTaskStatusAction");
    expect(source).toContain("production_calendar.update_task_status");
  });
});
