import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  API_MUTATION_RATE_LIMIT_AUDIT_ARTIFACT,
  API_MUTATION_RATE_LIMIT_AUDIT_NPM_SCRIPT,
  API_MUTATION_RATE_LIMIT_CI_NPM_SCRIPT,
} from "@/lib/qa/api-mutation-rate-limit-policy";
import {
  API_MUTATION_RATE_LIMIT_P1_17_ARTIFACT,
  API_MUTATION_RATE_LIMIT_P1_17_CHECK_NPM_SCRIPT,
  API_MUTATION_RATE_LIMIT_P1_17_CI_NPM_SCRIPT,
  API_MUTATION_RATE_LIMIT_P1_17_DOC,
  API_MUTATION_RATE_LIMIT_P1_17_ENFORCE_FN,
  API_MUTATION_RATE_LIMIT_P1_17_EXTENDS_POLICY_ID,
  API_MUTATION_RATE_LIMIT_P1_17_MIDDLEWARE_FN,
  API_MUTATION_RATE_LIMIT_P1_17_MIDDLEWARE_FILE,
  API_MUTATION_RATE_LIMIT_P1_17_POLICY_ID,
  API_MUTATION_RATE_LIMIT_P1_17_UNCOVERED_TARGET,
  API_MUTATION_RATE_LIMIT_P1_17_WIRING_PATHS,
} from "@/lib/security/api-mutation-rate-limit-p1-17-policy";
import {
  assertApiMutationRateLimitAuditPasses,
  auditApiMutationRateLimit,
} from "@/scripts/lib/api-mutation-rate-limit-audit";

const ROOT = process.cwd();

describe("API mutation rate limit coverage (P1-17)", () => {
  it("locks P1-17 policy and zero-uncovered target", () => {
    expect(API_MUTATION_RATE_LIMIT_P1_17_POLICY_ID).toBe("p1-17-api-mutation-rate-limit-v1");
    expect(API_MUTATION_RATE_LIMIT_P1_17_EXTENDS_POLICY_ID).toBe(
      "api-mutation-rate-limit-blueprint-v1",
    );
    expect(API_MUTATION_RATE_LIMIT_P1_17_UNCOVERED_TARGET).toBe(0);
  });

  it("audits all mutation routes with enforceApiRateLimit middleware or dedicated stacks", () => {
    const report = auditApiMutationRateLimit(ROOT);
    assertApiMutationRateLimitAuditPasses(report);

    const uncovered =
      report.mutationRoutes -
      report.middlewareCovered -
      report.dedicatedCovered -
      report.exemptClass;
    expect(uncovered).toBe(API_MUTATION_RATE_LIMIT_P1_17_UNCOVERED_TARGET);
    expect(report.middlewareCovered + report.dedicatedCovered).toBeGreaterThanOrEqual(100);
    expect(report.mutationRoutes).toBeGreaterThanOrEqual(190);
  });

  it("wires enforceApiMutationRateLimitMiddleware in middleware.ts", () => {
    const middleware = readFileSync(
      join(ROOT, API_MUTATION_RATE_LIMIT_P1_17_MIDDLEWARE_FILE),
      "utf8",
    );
    expect(middleware).toContain(API_MUTATION_RATE_LIMIT_P1_17_MIDDLEWARE_FN);
    expect(middleware).toContain("apiRateLimitBlock");
  });

  it("documents P1-17 and wires npm scripts + artifacts", () => {
    for (const rel of API_MUTATION_RATE_LIMIT_P1_17_WIRING_PATHS) {
      if (rel.endsWith(".json")) continue;
      expect(existsSync(join(ROOT, rel))).toBe(true);
    }

    const doc = readFileSync(join(ROOT, API_MUTATION_RATE_LIMIT_P1_17_DOC), "utf8");
    expect(doc).toContain(API_MUTATION_RATE_LIMIT_P1_17_POLICY_ID);
    expect(doc).toContain("enforceApiRateLimit");

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[API_MUTATION_RATE_LIMIT_P1_17_CHECK_NPM_SCRIPT]).toContain(
      "api-mutation-rate-limit-p1-17.test.ts",
    );
    expect(pkg.scripts?.[API_MUTATION_RATE_LIMIT_P1_17_CI_NPM_SCRIPT]).toContain(
      "api-mutation-rate-limit",
    );
    expect(pkg.scripts?.[API_MUTATION_RATE_LIMIT_AUDIT_NPM_SCRIPT]).toContain(
      "audit-api-mutation-rate-limit.ts",
    );
    expect(pkg.scripts?.[API_MUTATION_RATE_LIMIT_CI_NPM_SCRIPT]).toContain(
      "api-mutation-rate-limit.test.ts",
    );

    expect(existsSync(join(ROOT, API_MUTATION_RATE_LIMIT_AUDIT_ARTIFACT))).toBe(true);
    const audit = JSON.parse(
      readFileSync(join(ROOT, API_MUTATION_RATE_LIMIT_AUDIT_ARTIFACT), "utf8"),
    ) as {
      mutationRoutes: number;
      middlewareCovered: number;
      dedicatedCovered: number;
      exemptClass: number;
    };
    expect(
      audit.middlewareCovered + audit.dedicatedCovered + audit.exemptClass,
    ).toBe(audit.mutationRoutes);

    const summary = JSON.parse(
      readFileSync(join(ROOT, API_MUTATION_RATE_LIMIT_P1_17_ARTIFACT), "utf8"),
    ) as { policyId: string; uncoveredMutationRoutes: number };
    expect(summary.policyId).toBe(API_MUTATION_RATE_LIMIT_P1_17_POLICY_ID);
    expect(summary.uncoveredMutationRoutes).toBe(0);
  });
});
