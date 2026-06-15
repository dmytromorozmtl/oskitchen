import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditWeeklyGoNoGo,
  formatWeeklyGoNoGoAuditLines,
} from "@/lib/pm/weekly-go-no-go-p3-127-audit";
import {
  deriveWeeklyDecisionFromGates,
  loadWeeklyGoNoGoLog,
  validateWeeklyGoNoGoLog,
} from "@/lib/pm/weekly-go-no-go-p3-127-operations";
import {
  WEEKLY_GO_NO_GO_CI_WORKFLOW,
  WEEKLY_GO_NO_GO_DOC,
  WEEKLY_GO_NO_GO_GATES,
  WEEKLY_GO_NO_GO_LOG_ARTIFACT,
  WEEKLY_GO_NO_GO_NPM_SCRIPT,
  WEEKLY_GO_NO_GO_POLICY_ID,
  WEEKLY_GO_NO_GO_UNIT_TEST,
} from "@/lib/pm/weekly-go-no-go-p3-127-policy";

const ROOT = process.cwd();

describe("Weekly GO/NO-GO log (P3-127)", () => {
  it("locks policy id and four weekly gates", () => {
    expect(WEEKLY_GO_NO_GO_POLICY_ID).toBe("weekly-go-no-go-p3-127-v1");
    expect(WEEKLY_GO_NO_GO_GATES).toHaveLength(4);
    expect(WEEKLY_GO_NO_GO_GATES.map((gate) => gate.id)).toEqual([
      "sentry",
      "authed_rsc",
      "maintenance",
      "pipeline",
    ]);
  });

  it("validates weekly log artifact structure", () => {
    const log = loadWeeklyGoNoGoLog(ROOT);
    const validation = validateWeeklyGoNoGoLog(log);
    expect(validation.valid).toBe(true);
    expect(validation.hasEntries).toBe(true);
    expect(validation.gateIdsMatch).toBe(true);

    const latest = log.entries.at(-1);
    expect(latest?.decision).toBe("NO-GO");
    expect(latest?.gates).toHaveLength(4);
  });

  it("derives decisions from gate statuses", () => {
    expect(
      deriveWeeklyDecisionFromGates([
        { id: "sentry", status: "pass", command: "x", note: "y" },
        { id: "authed_rsc", status: "pass", command: "x", note: "y" },
        { id: "maintenance", status: "pass", command: "x", note: "y" },
        { id: "pipeline", status: "pass", command: "x", note: "y" },
      ]),
    ).toBe("GO");

    expect(
      deriveWeeklyDecisionFromGates([
        { id: "sentry", status: "fail", command: "x", note: "y" },
        { id: "authed_rsc", status: "pass", command: "x", note: "y" },
        { id: "maintenance", status: "pass", command: "x", note: "y" },
        { id: "pipeline", status: "fail", command: "x", note: "y" },
      ]),
    ).toBe("PARTIAL");
  });

  it("passes full weekly GO/NO-GO audit", () => {
    const summary = auditWeeklyGoNoGo(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.logValid).toBe(true);
    expect(summary.relatedPathsReferenced).toBe(true);
    expect(summary.gatesDocumented).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, WEEKLY_GO_NO_GO_DOC))).toBe(true);
    expect(existsSync(join(ROOT, WEEKLY_GO_NO_GO_LOG_ARTIFACT))).toBe(true);
    expect(existsSync(join(ROOT, WEEKLY_GO_NO_GO_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[WEEKLY_GO_NO_GO_NPM_SCRIPT]).toContain(
      "audit-weekly-go-no-go-p3-127.ts",
    );
    expect(pkg.scripts?.["test:ci:weekly-go-no-go-p3-127"]).toContain(WEEKLY_GO_NO_GO_UNIT_TEST);

    const workflow = readFileSync(join(ROOT, WEEKLY_GO_NO_GO_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:weekly-go-no-go-p3-127");
  });

  it("formats audit lines", () => {
    const summary = auditWeeklyGoNoGo(ROOT);
    const lines = formatWeeklyGoNoGoAuditLines(summary);
    expect(lines.some((line) => line.includes(WEEKLY_GO_NO_GO_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
