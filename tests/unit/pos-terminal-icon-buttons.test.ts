import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  auditPosTerminalIconButtonModule,
  auditPosTerminalIconButtons,
  findPosTerminalIconButtonViolations,
  POS_TERMINAL_ICON_BUTTON_AUDIT_POLICY_ID,
} from "@/lib/pos/pos-terminal-icon-button-audit-policy";
import {
  POS_TERMINAL_ICON_BUTTON_LABELS_POLICY_ID,
  POS_TERMINAL_ICON_BUTTON_MODULES,
  posTerminalDecreaseQuantityLabel,
  posTerminalIncreaseQuantityLabel,
} from "@/lib/pos/pos-terminal-icon-button-labels";

const ROOT = process.cwd();

describe("POS terminal icon button labels (Task 23)", () => {
  it("locks DES-35 policy id and label helpers", () => {
    expect(POS_TERMINAL_ICON_BUTTON_LABELS_POLICY_ID).toBe(
      "pos-terminal-icon-button-labels-des35-v1",
    );
    expect(POS_TERMINAL_ICON_BUTTON_AUDIT_POLICY_ID).toBe(
      POS_TERMINAL_ICON_BUTTON_LABELS_POLICY_ID,
    );
    expect(posTerminalDecreaseQuantityLabel("Latte")).toBe("Decrease quantity for Latte");
    expect(posTerminalIncreaseQuantityLabel("Latte")).toBe("Increase quantity for Latte");
  });

  it("detects icon buttons missing aria-label in synthetic source", () => {
    const violations = findPosTerminalIconButtonViolations(`
      <Button type="button" size="icon" variant="outline">
        <Minus />
      </Button>
    `);
    expect(violations).toHaveLength(1);
  });

  it("passes icon buttons with aria-label in opening tag", () => {
    const violations = findPosTerminalIconButtonViolations(`
      <Button type="button" size="icon" aria-label="Close shortcuts">
        <X />
      </Button>
    `);
    expect(violations).toHaveLength(0);
  });

  it("passes fleet audit for all POS terminal icon-button modules", () => {
    const report = auditPosTerminalIconButtons(ROOT);
    expect(report.modules).toHaveLength(POS_TERMINAL_ICON_BUTTON_MODULES.length);
    const failures = report.modules.filter((m) => !m.passed);
    expect(failures, failures.map((f) => `${f.module}:${f.violations[0]?.line}`).join(", ")).toEqual(
      [],
    );
    expect(report.passed).toBe(true);
  });

  it("pos-terminal-client cart controls expose item-specific aria-labels", () => {
    const source = readFileSync(
      join(ROOT, "components/dashboard/pos-terminal-client.tsx"),
      "utf8",
    );
    expect(source).toContain("posTerminalDecreaseQuantityLabel(line.title)");
    expect(source).toContain("posTerminalIncreaseQuantityLabel(line.title)");
    const audit = auditPosTerminalIconButtonModule(
      "components/dashboard/pos-terminal-client.tsx",
      ROOT,
    );
    expect(audit.passed).toBe(true);
  });

  it("pos-mobile-client cart controls expose item-specific aria-labels", () => {
    const source = readFileSync(join(ROOT, "components/pos/pos-mobile-client.tsx"), "utf8");
    expect(source).toContain("posTerminalDecreaseQuantityLabel(line.title)");
    expect(source).toContain("posTerminalIncreaseQuantityLabel(line.title)");
    const audit = auditPosTerminalIconButtonModule("components/pos/pos-mobile-client.tsx", ROOT);
    expect(audit.passed).toBe(true);
  });

  it("pos welcome banner dismiss button keeps accessible name", () => {
    const source = readFileSync(
      join(ROOT, "components/dashboard/pos-welcome-banner.tsx"),
      "utf8",
    );
    expect(source).toContain('aria-label="Dismiss"');
    const audit = auditPosTerminalIconButtonModule(
      "components/dashboard/pos-welcome-banner.tsx",
      ROOT,
    );
    expect(audit.passed).toBe(true);
  });
});
