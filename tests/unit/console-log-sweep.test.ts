import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditConsoleLogSurface,
} from "@/lib/devops/console-log-surface-audit";
import {
  CONSOLE_LOG_SWEEP_CI_WORKFLOW,
  CONSOLE_LOG_SWEEP_NPM_SCRIPT,
  CONSOLE_LOG_SWEEP_POLICY_ID,
  CONSOLE_LOG_SWEEP_TOP_50_COUNT,
  CONSOLE_LOG_SWEEP_TOP_50_FILES,
  CONSOLE_LOG_SWEEP_UNIT_TEST,
} from "@/lib/devops/console-log-sweep-policy";

const ROOT = process.cwd();

describe("console.log sweep (P1-38)", () => {
  it("locks policy id and top-50 file list", () => {
    expect(CONSOLE_LOG_SWEEP_POLICY_ID).toBe("console-log-sweep-p1-38-v1");
    expect(CONSOLE_LOG_SWEEP_TOP_50_FILES).toHaveLength(CONSOLE_LOG_SWEEP_TOP_50_COUNT);
    for (const file of CONSOLE_LOG_SWEEP_TOP_50_FILES) {
      expect(existsSync(join(ROOT, file)), file).toBe(true);
    }
  });

  it("passes Tier A/B audit with zero top-50 console.log", () => {
    const summary = auditConsoleLogSurface(ROOT);
    expect(summary.counts.runtime).toBe(0);
    expect(summary.counts.library).toBe(0);
    expect(summary.counts.top50Remaining).toBe(0);
    expect(summary.passed).toBe(true);
  });

  it("registers npm scripts, ESLint no-console, and deploy gate", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[CONSOLE_LOG_SWEEP_NPM_SCRIPT]).toContain(
      "audit-console-log-surface.ts",
    );
    expect(pkg.scripts?.["test:ci:console-log-sweep"]).toContain(CONSOLE_LOG_SWEEP_UNIT_TEST);

    const eslint = readFileSync(join(ROOT, "eslint.config.mjs"), "utf8");
    expect(eslint).toContain("no-console");

    const workflow = readFileSync(join(ROOT, CONSOLE_LOG_SWEEP_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("console-log-surface");
    expect(workflow).toContain("console-log-sweep-p3-71");
  });
});
