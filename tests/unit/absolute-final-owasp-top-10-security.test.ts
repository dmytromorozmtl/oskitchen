import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditOwaspTop10Wiring } from "@/lib/security/absolute-final-owasp-top-10-audit";
import {
  OWASP_TOP_10_ABSOLUTE_FINAL_POLICY_ID,
  OWASP_TOP_10_BLOCKED_CONTROLS,
  OWASP_TOP_10_CATEGORIES,
  OWASP_TOP_10_CATEGORY_COUNT,
  OWASP_TOP_10_DOC_PATH,
  OWASP_TOP_10_MANUAL_GATE_NOTE,
  OWASP_TOP_10_VERSION,
} from "@/lib/security/absolute-final-owasp-top-10-policy";

const ROOT = process.cwd();
/** Absolute Final Task 149 — full security audit OWASP Top 10 */
const TASK = 149;

describe(`OWASP Top 10 security audit (Absolute Final Task ${TASK})`, () => {
  it("locks absolute final OWASP Top 10 policy id and version", () => {
    expect(OWASP_TOP_10_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-owasp-top-10-v1");
    expect(OWASP_TOP_10_VERSION).toBe("2021");
    expect(OWASP_TOP_10_CATEGORY_COUNT).toBe(10);
    expect(OWASP_TOP_10_CATEGORIES).toHaveLength(10);
  });

  it("maps all 10 OWASP Top 10 2021 categories to control paths", () => {
    const ids = OWASP_TOP_10_CATEGORIES.map((c) => c.id);
    expect(ids).toEqual([
      "A01",
      "A02",
      "A03",
      "A04",
      "A05",
      "A06",
      "A07",
      "A08",
      "A09",
      "A10",
    ]);
    for (const category of OWASP_TOP_10_CATEGORIES) {
      expect(category.controlPaths.length).toBeGreaterThan(0);
    }
  });

  it("documents manual pen-test gate alongside automation", () => {
    expect(OWASP_TOP_10_MANUAL_GATE_NOTE).toContain("not a penetration test");
    expect(OWASP_TOP_10_BLOCKED_CONTROLS[0]).toContain("Sentry");
  });

  it("references security review doc with OWASP Top 10 certification", () => {
    const doc = readFileSync(join(ROOT, OWASP_TOP_10_DOC_PATH), "utf8");
    expect(doc).toContain("OWASP Top 10");
    expect(doc).toContain(OWASP_TOP_10_VERSION);
    expect(doc).toContain(OWASP_TOP_10_ABSOLUTE_FINAL_POLICY_ID);
    expect(doc).toContain("A01");
    expect(doc).toContain("A10");
  });

  it("consolidates RBAC and CSRF controls for access and design risks", () => {
    const policySource = readFileSync(
      join(ROOT, "lib/security/absolute-final-owasp-top-10-policy.ts"),
      "utf8",
    );
    expect(policySource).toContain("Absolute Final Task 149");
    expect(policySource).toContain("rbac-matrix-e2e-policy");
    expect(policySource).toContain("mutation-origin-guard");
    expect(policySource).toContain("csrf-server-actions-e2e-policy");
  });

  it("consolidates npm audit and webhook integrity gates", () => {
    const policySource = readFileSync(
      join(ROOT, "lib/security/absolute-final-owasp-top-10-policy.ts"),
      "utf8",
    );
    expect(policySource).toContain("npm-audit-ci-gate");
    expect(policySource).toContain("webhook-security-matrix");
    expect(policySource).toContain("api-mutation-rate-limit-audit");
  });

  it("passes OWASP Top 10 wiring audit", () => {
    const audit = auditOwaspTop10Wiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("locks CI cert script for OWASP Top 10 gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.["test:ci:owasp-top-10-absolute-final:cert"]).toContain(
      "absolute-final-owasp-top-10-security.test.ts",
    );
  });
});
