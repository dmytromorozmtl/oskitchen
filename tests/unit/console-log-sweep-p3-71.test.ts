import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditConsoleLogSweepP3_71,
  formatConsoleLogSweepP3_71AuditLines,
} from "@/lib/devops/console-log-sweep-p3-71-audit";
import { validateConsoleLogSweepContract } from "@/lib/devops/console-log-sweep-p3-71-measurement";
import {
  CONSOLE_LOG_SWEEP_P3_71_AUDIT_SCRIPT,
  CONSOLE_LOG_SWEEP_P3_71_CHECK_NPM_SCRIPT,
  CONSOLE_LOG_SWEEP_P3_71_DOC,
  CONSOLE_LOG_SWEEP_P3_71_NPM_SCRIPT,
  CONSOLE_LOG_SWEEP_P3_71_NPM_SCRIPTS,
  CONSOLE_LOG_SWEEP_P3_71_POLICY_ID,
  CONSOLE_LOG_SWEEP_P3_71_RUNTIME_DIRS,
  CONSOLE_LOG_SWEEP_P3_71_UNIT_TEST,
  CONSOLE_LOG_SWEEP_P3_71_UPSTREAM_POLICY_ID,
  CONSOLE_LOG_SWEEP_P3_71_UPSTREAM_TEST,
} from "@/lib/devops/console-log-sweep-p3-71-policy";

const ROOT = process.cwd();

describe("Console.log sweep (P3-71)", () => {
  it("locks P3-71 policy and production runtime dirs", () => {
    expect(CONSOLE_LOG_SWEEP_P3_71_POLICY_ID).toBe("console-log-sweep-p3-71-v1");
    expect(CONSOLE_LOG_SWEEP_P3_71_UPSTREAM_POLICY_ID).toBe("console-log-sweep-p1-38-v1");
    expect(CONSOLE_LOG_SWEEP_P3_71_RUNTIME_DIRS).toEqual([
      "app",
      "components",
      "actions",
      "services",
    ]);
  });

  it("validates zero console.log in production runtime paths", () => {
    const validation = validateConsoleLogSweepContract(ROOT);
    expect(validation.passed, validation.failures.join("; ")).toBe(true);
    expect(validation.runtimeZero).toBe(true);
    expect(validation.libraryZero).toBe(true);
    expect(validation.top50Zero).toBe(true);
    expect(validation.eslintNoConsole).toBe(true);
    expect(validation.upstreamPolicyAligned).toBe(true);
  });

  it("passes full console.log sweep P3-71 audit", () => {
    const summary = auditConsoleLogSweepP3_71(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.contractValid).toBe(true);
    expect(summary.upstreamPolicyAligned).toBe(true);
    expect(summary.npmScriptsWired).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatConsoleLogSweepP3_71AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script, upstream test, and npm wiring", () => {
    expect(existsSync(join(ROOT, CONSOLE_LOG_SWEEP_P3_71_DOC))).toBe(true);
    expect(existsSync(join(ROOT, CONSOLE_LOG_SWEEP_P3_71_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, CONSOLE_LOG_SWEEP_P3_71_UNIT_TEST))).toBe(true);
    expect(existsSync(join(ROOT, CONSOLE_LOG_SWEEP_P3_71_UPSTREAM_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[CONSOLE_LOG_SWEEP_P3_71_NPM_SCRIPT]).toContain(
      "audit-console-log-sweep-p3-71.ts",
    );
    expect(pkg.scripts?.[CONSOLE_LOG_SWEEP_P3_71_CHECK_NPM_SCRIPT]).toContain(
      CONSOLE_LOG_SWEEP_P3_71_UNIT_TEST,
    );
    for (const script of CONSOLE_LOG_SWEEP_P3_71_NPM_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
  });
});
