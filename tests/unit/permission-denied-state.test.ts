import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditPermissionDeniedState,
  formatPermissionDeniedStateAuditLines,
} from "@/lib/design/permission-denied-state-audit";
import {
  PERMISSION_DENIED_STATE_AUDIT_SCRIPT,
  PERMISSION_DENIED_STATE_CI_WORKFLOW,
  PERMISSION_DENIED_STATE_MODULE,
  PERMISSION_DENIED_STATE_NPM_SCRIPT,
  PERMISSION_DENIED_STATE_POLICY_ID,
  PERMISSION_DENIED_STATE_REQUEST_ACCESS_HREF,
  PERMISSION_DENIED_STATE_REQUEST_ACCESS_LABEL,
  PERMISSION_DENIED_STATE_REQUEST_ACCESS_TEST_ID,
  PERMISSION_DENIED_STATE_REQUIRED_ELEMENTS,
  PERMISSION_DENIED_STATE_UNIT_TEST,
} from "@/lib/design/permission-denied-state-policy";

const ROOT = process.cwd();

describe("permission-denied state (P1-59)", () => {
  it("locks policy id and required state elements", () => {
    expect(PERMISSION_DENIED_STATE_POLICY_ID).toBe("permission-denied-state-p1-59-v1");
    expect(PERMISSION_DENIED_STATE_REQUIRED_ELEMENTS).toEqual([
      "icon",
      "message",
      "request_access",
    ]);
    expect(PERMISSION_DENIED_STATE_REQUEST_ACCESS_LABEL).toBe("Request access");
    expect(PERMISSION_DENIED_STATE_REQUEST_ACCESS_HREF).toBe("/dashboard/staff");
  });

  it("ships icon, message, and Request access CTA in card module", () => {
    const source = readFileSync(join(ROOT, PERMISSION_DENIED_STATE_MODULE), "utf8");
    expect(source).toContain("ShieldOff");
    expect(source).toContain("CardTitle");
    expect(source).toContain("CardDescription");
    expect(source).toContain("PERMISSION_DENIED_STATE_REQUEST_ACCESS_LABEL");
    expect(source).toContain("PERMISSION_DENIED_STATE_REQUEST_ACCESS_TEST_ID");
    expect(source).toContain("helpHref={PERMISSION_DENIED_STATE_REQUEST_ACCESS_HREF}");
    expect(source).toContain("helpLabel={PERMISSION_DENIED_STATE_REQUEST_ACCESS_LABEL}");
  });

  it("passes full permission-denied state audit", () => {
    const summary = auditPermissionDeniedState(ROOT);
    expect(summary.modulePresent).toBe(true);
    expect(summary.iconWired).toBe(true);
    expect(summary.messageWired).toBe(true);
    expect(summary.requestAccessWired).toBe(true);
    expect(summary.surfaceCardPassesHelpCta).toBe(true);
    expect(summary.rbacAuditPassed).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, PERMISSION_DENIED_STATE_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, PERMISSION_DENIED_STATE_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[PERMISSION_DENIED_STATE_NPM_SCRIPT]).toContain(
      "audit-permission-denied-state.ts",
    );
    expect(pkg.scripts?.["test:ci:permission-denied-state"]).toContain(
      PERMISSION_DENIED_STATE_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, PERMISSION_DENIED_STATE_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:permission-denied-state");
  });

  it("formats audit lines", () => {
    const summary = auditPermissionDeniedState(ROOT);
    const lines = formatPermissionDeniedStateAuditLines(summary);
    expect(lines.some((line) => line.includes(PERMISSION_DENIED_STATE_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
