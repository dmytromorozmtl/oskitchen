import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditDemoPageP129,
  formatDemoPageP129AuditLines,
} from "@/lib/marketing/demo-page-p1-29-audit";
import {
  DEMO_PAGE_P1_29_INTEGRATION_CHANNELS,
  DEMO_PAGE_P1_29_WORKSPACE_STOPS,
} from "@/lib/marketing/demo-page-p1-29-content";
import {
  DEMO_PAGE_P1_29_CHANNEL_COUNT,
  DEMO_PAGE_P1_29_CHECK_NPM_SCRIPT,
  DEMO_PAGE_P1_29_DOC,
  DEMO_PAGE_P1_29_HEADLINE,
  DEMO_PAGE_P1_29_INTEGRATION_HEALTH_TEST_ID,
  DEMO_PAGE_P1_29_NPM_SCRIPT,
  DEMO_PAGE_P1_29_POLICY_ID,
  DEMO_PAGE_P1_29_ROUTE,
  DEMO_PAGE_P1_29_SANDBOX_TEST_ID,
  DEMO_PAGE_P1_29_UNIT_TEST,
  DEMO_PAGE_P1_29_WORKSPACE_STOP_COUNT,
} from "@/lib/marketing/demo-page-p1-29-policy";

const ROOT = process.cwd();

describe("Demo page — interactive sandbox workspace (P1-29)", () => {
  it("locks policy id, route, and Integration Health channel count", () => {
    expect(DEMO_PAGE_P1_29_POLICY_ID).toBe("demo-page-p1-29-v1");
    expect(DEMO_PAGE_P1_29_ROUTE).toBe("/demo");
    expect(DEMO_PAGE_P1_29_HEADLINE).toContain("Integration Health");
    expect(DEMO_PAGE_P1_29_CHANNEL_COUNT).toBe(6);
    expect(DEMO_PAGE_P1_29_WORKSPACE_STOP_COUNT).toBe(5);
    expect(DEMO_PAGE_P1_29_INTEGRATION_CHANNELS).toHaveLength(6);
    expect(DEMO_PAGE_P1_29_WORKSPACE_STOPS).toHaveLength(5);
  });

  it("includes honest FAILED and SKIPPED integration examples", () => {
    const statuses = DEMO_PAGE_P1_29_INTEGRATION_CHANNELS.map((c) => c.status);
    expect(statuses).toContain("FAILED");
    expect(statuses).toContain("SKIPPED");
    expect(statuses).toContain("PASS");
    const doordash = DEMO_PAGE_P1_29_INTEGRATION_CHANNELS.find((c) => c.id === "doordash");
    expect(doordash?.code).toBe("AUTH_DEGRADED");
  });

  it("passes full P1-29 demo page audit", () => {
    const summary = auditDemoPageP129(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.channelCountCorrect).toBe(true);
    expect(summary.workspaceStopCountCorrect).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("ships interactive sandbox with Integration Health test ids", () => {
    const source = readFileSync(
      join(ROOT, "components/marketing/demo-interactive-sandbox-workspace.tsx"),
      "utf8",
    );
    expect(source).toContain("DemoInteractiveSandboxWorkspace");
    expect(source).toContain("DEMO_PAGE_P1_29_SANDBOX_TEST_ID");
    expect(source).toContain("DEMO_PAGE_P1_29_INTEGRATION_HEALTH_TEST_ID");
    expect(source).toContain("demo-sandbox-channel-${channel.id}");
  });

  it("registers audit script and check npm wiring", () => {
    expect(existsSync(join(ROOT, DEMO_PAGE_P1_29_DOC))).toBe(true);
    expect(existsSync(join(ROOT, DEMO_PAGE_P1_29_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[DEMO_PAGE_P1_29_NPM_SCRIPT]).toContain("audit-demo-page-p1-29.ts");
    expect(pkg.scripts?.[DEMO_PAGE_P1_29_CHECK_NPM_SCRIPT]).toContain(DEMO_PAGE_P1_29_UNIT_TEST);
  });

  it("formats audit lines", () => {
    const summary = auditDemoPageP129(ROOT);
    const lines = formatDemoPageP129AuditLines(summary);
    expect(lines.some((line) => line.includes(DEMO_PAGE_P1_29_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
