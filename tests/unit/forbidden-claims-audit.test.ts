import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditForbiddenClaimsMarketingPages,
  formatForbiddenClaimsAuditLines,
} from "@/lib/marketing/forbidden-claims-audit";
import {
  FORBIDDEN_CLAIMS_AUDIT_ARTIFACT,
  FORBIDDEN_CLAIMS_AUDIT_AUDIT_SCRIPT,
  FORBIDDEN_CLAIMS_AUDIT_CI_WORKFLOW,
  FORBIDDEN_CLAIMS_AUDIT_DOC,
  FORBIDDEN_CLAIMS_AUDIT_NPM_SCRIPT,
  FORBIDDEN_CLAIMS_AUDIT_POLICY_ID,
  FORBIDDEN_CLAIMS_AUDIT_ROUTES,
  FORBIDDEN_CLAIMS_AUDIT_UNIT_TEST,
} from "@/lib/marketing/forbidden-claims-audit-policy";

const ROOT = process.cwd();

describe("Forbidden claims audit (P1-71)", () => {
  it("locks policy id and five audited routes", () => {
    expect(FORBIDDEN_CLAIMS_AUDIT_POLICY_ID).toBe("forbidden-claims-audit-p1-71-v1");
    expect(FORBIDDEN_CLAIMS_AUDIT_ROUTES.map((entry) => entry.route)).toEqual([
      "/",
      "/pricing",
      "/demo",
      "/trust",
      "/shopify",
    ]);
  });

  it("passes full forbidden claims marketing pages audit", () => {
    const summary = auditForbiddenClaimsMarketingPages(ROOT);
    expect(summary.docPresent).toBe(true);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.upstreamPolicyPresent).toBe(true);
    expect(summary.routes).toHaveLength(5);
    expect(summary.totalRealClaims).toBe(0);
    expect(summary.routes.every((route) => route.passed)).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("artifact records zero real claims across routes", () => {
    const artifact = JSON.parse(
      readFileSync(join(ROOT, FORBIDDEN_CLAIMS_AUDIT_ARTIFACT), "utf8"),
    ) as {
      policyId: string;
      totalRealClaims: number;
      passed: boolean;
      routes: Array<{ route: string; realClaimCount: number }>;
    };
    expect(artifact.policyId).toBe(FORBIDDEN_CLAIMS_AUDIT_POLICY_ID);
    expect(artifact.totalRealClaims).toBe(0);
    expect(artifact.passed).toBe(true);
    expect(artifact.routes).toHaveLength(5);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, FORBIDDEN_CLAIMS_AUDIT_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, FORBIDDEN_CLAIMS_AUDIT_UNIT_TEST))).toBe(true);
    expect(existsSync(join(ROOT, FORBIDDEN_CLAIMS_AUDIT_DOC))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[FORBIDDEN_CLAIMS_AUDIT_NPM_SCRIPT]).toContain(
      "audit-forbidden-claims-marketing-pages.ts",
    );
    expect(pkg.scripts?.["test:ci:forbidden-claims-audit"]).toContain(
      FORBIDDEN_CLAIMS_AUDIT_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, FORBIDDEN_CLAIMS_AUDIT_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:forbidden-claims-marketing-pages");
  });

  it("formats audit lines", () => {
    const summary = auditForbiddenClaimsMarketingPages(ROOT);
    const lines = formatForbiddenClaimsAuditLines(summary);
    expect(lines.some((line) => line.includes(FORBIDDEN_CLAIMS_AUDIT_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("/pricing"))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
