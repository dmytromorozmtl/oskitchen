import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditKdsBumpTicketUx,
  formatKdsBumpTicketUxAuditLines,
} from "@/lib/design/kds-bump-ticket-ux-audit";
import {
  KDS_BUMP_TICKET_DAILY_SERVICE_MODULE,
  KDS_BUMP_TICKET_MIN_TOUCH_PX,
  KDS_BUMP_TICKET_UX_AUDIT_SCRIPT,
  KDS_BUMP_TICKET_UX_CI_WORKFLOW,
  KDS_BUMP_TICKET_UX_NPM_SCRIPT,
  KDS_BUMP_TICKET_UX_POLICY_ID,
  KDS_BUMP_TICKET_UX_REQUIRED_ELEMENTS,
  KDS_BUMP_TICKET_UX_UNIT_TEST,
  KDS_BUMP_TICKET_UNDO_WINDOW_MS,
} from "@/lib/design/kds-bump-ticket-ux-policy";

const ROOT = process.cwd();

describe("KDS bump ticket UX (P1-62)", () => {
  it("locks policy id, 64px target, and 3s undo window", () => {
    expect(KDS_BUMP_TICKET_UX_POLICY_ID).toBe("kds-bump-ticket-ux-p1-62-v1");
    expect(KDS_BUMP_TICKET_MIN_TOUCH_PX).toBe(64);
    expect(KDS_BUMP_TICKET_UNDO_WINDOW_MS).toBe(3000);
    expect(KDS_BUMP_TICKET_UX_REQUIRED_ELEMENTS).toEqual([
      "large_target",
      "haptic",
      "visual_confirmation",
      "undo_3s",
    ]);
  });

  it("ships large target button class in daily service", () => {
    const source = readFileSync(join(ROOT, KDS_BUMP_TICKET_DAILY_SERVICE_MODULE), "utf8");
    expect(source).toContain("KDS_BUMP_TICKET_BUTTON_CLASS");
    expect(source).toContain("triggerKdsHaptic");
    expect(source).toContain("KdsBumpUndoStrip");
    expect(source).toContain("confirmedBumpId");
  });

  it("passes full KDS bump ticket UX audit", () => {
    const summary = auditKdsBumpTicketUx(ROOT);
    expect(summary.dailyServicePresent).toBe(true);
    expect(summary.nextStripPresent).toBe(true);
    expect(summary.undoStripPresent).toBe(true);
    expect(summary.largeTargetWired).toBe(true);
    expect(summary.hapticWired).toBe(true);
    expect(summary.visualConfirmationWired).toBe(true);
    expect(summary.undo3sWired).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, KDS_BUMP_TICKET_UX_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, KDS_BUMP_TICKET_UX_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[KDS_BUMP_TICKET_UX_NPM_SCRIPT]).toContain(
      "audit-kds-bump-ticket-ux.ts",
    );
    expect(pkg.scripts?.["test:ci:kds-bump-ticket-ux"]).toContain(
      KDS_BUMP_TICKET_UX_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, KDS_BUMP_TICKET_UX_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:kds-bump-ticket-ux");
  });

  it("formats audit lines", () => {
    const summary = auditKdsBumpTicketUx(ROOT);
    const lines = formatKdsBumpTicketUxAuditLines(summary);
    expect(lines.some((line) => line.includes(KDS_BUMP_TICKET_UX_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
