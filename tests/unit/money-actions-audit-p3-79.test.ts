import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { auditAllMoneyActions } from "@/lib/audit/money-actions-audit-policy";
import {
  auditMoneyActionsAuditP3_79,
  formatMoneyActionsAuditP3_79AuditLines,
} from "@/lib/audit/money-actions-audit-p3-79-audit";
import { validateMoneyActionsAuditContract } from "@/lib/audit/money-actions-audit-p3-79-measurement";
import {
  MONEY_ACTIONS_AUDIT_P3_79_AUDIT_SCRIPT,
  MONEY_ACTIONS_AUDIT_P3_79_CHECK_NPM_SCRIPT,
  MONEY_ACTIONS_AUDIT_P3_79_DOC,
  MONEY_ACTIONS_AUDIT_P3_79_NPM_SCRIPT,
  MONEY_ACTIONS_AUDIT_P3_79_NPM_SCRIPTS,
  MONEY_ACTIONS_AUDIT_P3_79_POLICY_ID,
  MONEY_ACTIONS_AUDIT_P3_79_REGISTRY_COUNT,
  MONEY_ACTIONS_AUDIT_P3_79_TERMINAL_ROUTE,
  MONEY_ACTIONS_AUDIT_P3_79_UNIT_TEST,
  MONEY_ACTIONS_AUDIT_P3_79_UPSTREAM_POLICY_ID,
  MONEY_ACTIONS_AUDIT_P3_79_UPSTREAM_TEST,
} from "@/lib/audit/money-actions-audit-p3-79-policy";

const ROOT = process.cwd();

describe("Money actions audit log (P3-79)", () => {
  it("locks P3-79 policy and upstream registry count", () => {
    expect(MONEY_ACTIONS_AUDIT_P3_79_POLICY_ID).toBe("money-actions-audit-p3-79-v1");
    expect(MONEY_ACTIONS_AUDIT_P3_79_UPSTREAM_POLICY_ID).toBe("money-actions-audit-p1-31-v1");
    expect(MONEY_ACTIONS_AUDIT_P3_79_REGISTRY_COUNT).toBe(14);
  });

  it("validates upstream registry + terminal route wiring", () => {
    const validation = validateMoneyActionsAuditContract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.upstreamRegistryOk).toBe(true);
    expect(validation.terminalRouteWired).toBe(true);
  });

  it("passes full money actions P3-79 audit", () => {
    const summary = auditMoneyActionsAuditP3_79(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.npmScriptsWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatMoneyActionsAuditP3_79AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script, upstream test, and npm wiring", () => {
    expect(existsSync(join(ROOT, MONEY_ACTIONS_AUDIT_P3_79_DOC))).toBe(true);
    expect(existsSync(join(ROOT, MONEY_ACTIONS_AUDIT_P3_79_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, MONEY_ACTIONS_AUDIT_P3_79_UNIT_TEST))).toBe(true);
    expect(existsSync(join(ROOT, MONEY_ACTIONS_AUDIT_P3_79_UPSTREAM_TEST))).toBe(true);
    expect(existsSync(join(ROOT, MONEY_ACTIONS_AUDIT_P3_79_TERMINAL_ROUTE))).toBe(true);

    const upstream = auditAllMoneyActions(ROOT);
    expect(upstream.passed).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[MONEY_ACTIONS_AUDIT_P3_79_NPM_SCRIPT]).toContain(
      "audit-money-actions-audit-p3-79.ts",
    );
    expect(pkg.scripts?.[MONEY_ACTIONS_AUDIT_P3_79_CHECK_NPM_SCRIPT]).toContain(
      MONEY_ACTIONS_AUDIT_P3_79_UNIT_TEST,
    );
    for (const script of MONEY_ACTIONS_AUDIT_P3_79_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });
});
