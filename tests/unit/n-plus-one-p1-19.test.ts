import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  N_PLUS_ONE_P1_19_ARTIFACT,
  N_PLUS_ONE_P1_19_CHECK_NPM_SCRIPT,
  N_PLUS_ONE_P1_19_CI_NPM_SCRIPT,
  N_PLUS_ONE_P1_19_CI_WORKFLOW,
  N_PLUS_ONE_P1_19_DOC,
  N_PLUS_ONE_P1_19_FORBIDDEN_PATTERN,
  N_PLUS_ONE_P1_19_POLICY_ID,
  N_PLUS_ONE_P1_19_TARGET_COUNT,
  N_PLUS_ONE_P1_19_TARGETS,
  N_PLUS_ONE_P1_19_WIRING_PATHS,
} from "@/lib/perf/n-plus-one-p1-19-policy";

const ROOT = process.cwd();

describe("N+1 batch fixes (P1-19)", () => {
  it("locks P1-19 policy and seven batch targets", () => {
    expect(N_PLUS_ONE_P1_19_POLICY_ID).toBe("p1-19-n-plus-one-batch-v1");
    expect(N_PLUS_ONE_P1_19_TARGET_COUNT).toBe(7);
    expect(N_PLUS_ONE_P1_19_TARGETS).toHaveLength(7);
  });

  for (const target of N_PLUS_ONE_P1_19_TARGETS) {
    it(`batches queries in ${target.file}`, () => {
      const source = readFileSync(join(ROOT, target.file), "utf8");
      for (const marker of target.batchMarkers) {
        expect(source, `${target.id} missing ${marker}`).toContain(marker);
      }
      expect(source, `${target.id} still uses map(async)`).not.toContain(
        N_PLUS_ONE_P1_19_FORBIDDEN_PATTERN,
      );
    });
  }

  it("documents P1-19 and wires npm scripts + CI workflow", () => {
    for (const rel of N_PLUS_ONE_P1_19_WIRING_PATHS) {
      if (rel.endsWith(".json")) continue;
      expect(existsSync(join(ROOT, rel))).toBe(true);
    }

    const doc = readFileSync(join(ROOT, N_PLUS_ONE_P1_19_DOC), "utf8");
    expect(doc).toContain(N_PLUS_ONE_P1_19_POLICY_ID);
    expect(doc).toContain("computeCustomerHealthBatch");

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[N_PLUS_ONE_P1_19_CHECK_NPM_SCRIPT]).toContain("n-plus-one-p1-19.test.ts");
    expect(pkg.scripts?.[N_PLUS_ONE_P1_19_CI_NPM_SCRIPT]).toContain("n-plus-one-p1-19.test.ts");

    const workflow = readFileSync(join(ROOT, N_PLUS_ONE_P1_19_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("n-plus-one-p1-19");

    const artifact = JSON.parse(readFileSync(join(ROOT, N_PLUS_ONE_P1_19_ARTIFACT), "utf8")) as {
      policyId: string;
      targetsFixed: number;
    };
    expect(artifact.policyId).toBe(N_PLUS_ONE_P1_19_POLICY_ID);
    expect(artifact.targetsFixed).toBe(7);
  });
});
