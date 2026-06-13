import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditSkippedTestsP2_34,
  formatSkippedTestsAuditP2_34Lines,
} from "@/lib/qa/skipped-tests-audit-p2-34-audit";
import {
  SKIPPED_TESTS_AUDIT_P2_34_AUDIT_SCRIPT,
  SKIPPED_TESTS_AUDIT_P2_34_CI_WORKFLOW,
  SKIPPED_TESTS_AUDIT_P2_34_DOC,
  SKIPPED_TESTS_AUDIT_P2_34_ENTRIES,
  SKIPPED_TESTS_AUDIT_P2_34_FLOW_STEPS,
  SKIPPED_TESTS_AUDIT_P2_34_NPM_SCRIPT,
  SKIPPED_TESTS_AUDIT_P2_34_POLICY_ID,
  SKIPPED_TESTS_AUDIT_P2_34_TARGET_COUNT,
  SKIPPED_TESTS_AUDIT_P2_34_UNIT_TEST,
  countSkippedTestsAuditP2_34ByDisposition,
} from "@/lib/qa/skipped-tests-audit-p2-34-policy";
import {
  countSkippedTestInventoryHits,
  scanSkippedTestPatterns,
} from "@/lib/qa/skipped-tests-inventory";

const ROOT = process.cwd();

describe("Skipped tests audit (P2-34)", () => {
  it("locks policy id and twenty-entry registry", () => {
    expect(SKIPPED_TESTS_AUDIT_P2_34_POLICY_ID).toBe("skipped-tests-audit-p2-34-v1");
    expect(SKIPPED_TESTS_AUDIT_P2_34_ENTRIES).toHaveLength(SKIPPED_TESTS_AUDIT_P2_34_TARGET_COUNT);
    expect(SKIPPED_TESTS_AUDIT_P2_34_FLOW_STEPS).toHaveLength(4);
    expect(countSkippedTestsAuditP2_34ByDisposition("fixed")).toBe(20);
  });

  it("scans skip patterns across tests/ and e2e/", () => {
    const hits = scanSkippedTestPatterns(ROOT);
    expect(hits.length).toBeGreaterThan(0);
    expect(countSkippedTestInventoryHits(ROOT)).toBe(hits.length);
    expect(hits.some((h) => h.pattern === "describe.skipIf")).toBe(true);
  });

  it("audits registry, doc, playwright wiring, and login skip removal", () => {
    const summary = auditSkippedTestsP2_34(ROOT);
    expect(summary.registryCount).toBe(20);
    expect(summary.fixedCount).toBe(20);
    expect(summary.docPresent).toBe(true);
    expect(summary.playwrightWired).toBe(true);
    expect(summary.loginSkipRemoved).toBe(true);
    expect(summary.sessionCookieSkipRemoved).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, SKIPPED_TESTS_AUDIT_P2_34_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, SKIPPED_TESTS_AUDIT_P2_34_DOC))).toBe(true);
    expect(existsSync(join(ROOT, SKIPPED_TESTS_AUDIT_P2_34_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[SKIPPED_TESTS_AUDIT_P2_34_NPM_SCRIPT]).toContain(
      "audit-skipped-tests-p2-34.ts",
    );
    expect(pkg.scripts?.["check:skipped-tests-p2-34"]).toContain(SKIPPED_TESTS_AUDIT_P2_34_UNIT_TEST);

    const archive = JSON.parse(
      readFileSync(join(ROOT, "config/npm-scripts/archive-v1.json"), "utf8"),
    ) as { scripts?: Record<string, string> };
    expect(archive.scripts?.["test:ci:skipped-tests-p2-34"]).toContain(
      SKIPPED_TESTS_AUDIT_P2_34_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, SKIPPED_TESTS_AUDIT_P2_34_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("skipped-tests-p2-34");
  });

  it("formats audit lines", () => {
    const summary = auditSkippedTestsP2_34(ROOT);
    const lines = formatSkippedTestsAuditP2_34Lines(summary);
    expect(lines.some((line) => line.includes(SKIPPED_TESTS_AUDIT_P2_34_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
