import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  findForbiddenPhraseViolations,
  MARKETING_CLAIMS_FORBIDDEN_PHRASES,
} from "@/lib/governance/marketing-claims-governance-policy";
import {
  FORBIDDEN_CLAIMS_CI_GATE_ARTIFACT,
  FORBIDDEN_CLAIMS_CI_GATE_CI_WORKFLOW,
  FORBIDDEN_CLAIMS_CI_GATE_ENFORCEMENT_SCRIPT,
  FORBIDDEN_CLAIMS_CI_GATE_NPM_SCRIPT,
  FORBIDDEN_CLAIMS_CI_GATE_POLICY_ID,
  FORBIDDEN_CLAIMS_CI_GATE_SCRIPT,
  FORBIDDEN_CLAIMS_CI_GATE_TEST_SCRIPT,
  FORBIDDEN_CLAIMS_CI_GATE_UNIT_TEST,
  FORBIDDEN_CLAIMS_CI_GATE_VERIFY_WORKFLOW,
} from "@/lib/marketing/forbidden-claims-ci-gate-policy";
import { runForbiddenClaimsCiGate } from "../../scripts/gate-forbidden-claims";

const ROOT = process.cwd();

describe("forbidden claims CI gate (P0-6)", () => {
  it("locks P0-6 policy id and artifact path", () => {
    expect(FORBIDDEN_CLAIMS_CI_GATE_POLICY_ID).toBe("p0-6-forbidden-claims-ci-gate-v1");
    expect(FORBIDDEN_CLAIMS_CI_GATE_ARTIFACT).toBe("artifacts/forbidden-claims-ci-gate.json");
    expect(FORBIDDEN_CLAIMS_CI_GATE_SCRIPT).toBe("scripts/gate-forbidden-claims.ts");
  });

  it("detects matrix forbidden phrases", () => {
    for (const phrase of MARKETING_CLAIMS_FORBIDDEN_PHRASES.slice(0, 3)) {
      expect(findForbiddenPhraseViolations(`We offer ${phrase} today.`)).toHaveLength(1);
    }
  });

  it("passes live marketing scan for forbidden phrases", () => {
    const result = runForbiddenClaimsCiGate({ MARKETING_CLAIMS_STRICT: "0" });
    expect(result.forbiddenCount).toBe(0);
    expect(result.passed).toBe(true);
  });

  it("wires gate script, npm scripts, and CI workflows", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[FORBIDDEN_CLAIMS_CI_GATE_NPM_SCRIPT]).toContain(
      "gate-forbidden-claims.ts",
    );
    expect(pkg.scripts?.[FORBIDDEN_CLAIMS_CI_GATE_TEST_SCRIPT]).toContain(
      FORBIDDEN_CLAIMS_CI_GATE_UNIT_TEST,
    );
    expect(pkg.scripts?.[FORBIDDEN_CLAIMS_CI_GATE_ENFORCEMENT_SCRIPT]).toContain(
      FORBIDDEN_CLAIMS_CI_GATE_NPM_SCRIPT,
    );

    const ci = readFileSync(join(ROOT, FORBIDDEN_CLAIMS_CI_GATE_CI_WORKFLOW), "utf8");
    expect(ci).toContain(FORBIDDEN_CLAIMS_CI_GATE_NPM_SCRIPT);
    expect(ci).toContain("Forbidden claims CI gate");

    const verify = readFileSync(join(ROOT, FORBIDDEN_CLAIMS_CI_GATE_VERIFY_WORKFLOW), "utf8");
    expect(verify).toContain(FORBIDDEN_CLAIMS_CI_GATE_NPM_SCRIPT);
    expect(verify).toContain("pull_request");
  });
});
