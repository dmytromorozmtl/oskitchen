import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  ACCOUNTANT_PORTAL_COMPONENT_PATH,
  ACCOUNTANT_PORTAL_HONESTY_MARKERS,
  ACCOUNTANT_PORTAL_PAGE_PATH,
  ACCOUNTANT_PORTAL_PILLARS,
  ACCOUNTANT_PORTAL_ROUTE,
} from "@/lib/accounting/accountant-portal-absolute-final-policy";
import { auditAccountantPortalWiring } from "@/lib/accounting/accountant-portal-audit";
import { auditDesignFullPolishSlot } from "@/lib/design/absolute-final-design-full-polish-audit";
import {
  DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID,
  getDesignFullPolishSlot,
} from "@/lib/design/absolute-final-design-full-polish-policy";
import {
  DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID,
  DESIGN_POLISH_DARK_MODE_TOKENS,
  DESIGN_POLISH_TOKEN_NAMES,
} from "@/lib/design/absolute-final-design-polish-tokens";

const ROOT = process.cwd();
/** Absolute Final Task 129 — Design full polish for feature 99 accountant portal */
const TASK = 129;
const FEATURE = 99;

describe(`Design full polish — accountant portal (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks design polish registry slot 129 → feature 99 accountant portal", () => {
    expect(DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-design-full-polish-v1",
    );
    const slot = getDesignFullPolishSlot(TASK);
    expect(slot?.featureKey).toBe("accountant-portal");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetKind).toBe("component");
    expect(slot?.targetPath).toBe(ACCOUNTANT_PORTAL_COMPONENT_PATH);
  });

  it("applies design polish card, hero, and row tokens to the accountant portal panel", () => {
    const panel = readFileSync(join(ROOT, ACCOUNTANT_PORTAL_COMPONENT_PATH), "utf8");
    for (const token of DESIGN_POLISH_TOKEN_NAMES) {
      expect(panel, `missing ${token}`).toContain(token);
    }
    expect(panel).toContain("absolute-final-design-polish-tokens");
    expect(panel).toContain("DESIGN_POLISH_STRIPE_OK_CLASS");
    expect(panel).toContain("DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID");
  });

  it("includes dark mode polish tokens on deliverable rows and export bundle", () => {
    const panel = readFileSync(join(ROOT, ACCOUNTANT_PORTAL_COMPONENT_PATH), "utf8");
    const tokens = readFileSync(
      join(ROOT, "lib/design/absolute-final-design-polish-tokens.ts"),
      "utf8",
    );
    expect(panel).toContain("dark:text-muted-foreground/90");
    expect(panel).toContain("dark:border-border/50");
    expect(tokens).toContain(DESIGN_POLISH_DARK_MODE_TOKENS[0]);
  });

  it("shows hero banner with read-only and certified GL honesty", () => {
    const panel = readFileSync(join(ROOT, ACCOUNTANT_PORTAL_COMPONENT_PATH), "utf8");
    for (const marker of ACCOUNTANT_PORTAL_HONESTY_MARKERS) {
      expect(panel).toContain(marker);
    }
    expect(panel).toContain('role="note"');
    expect(ACCOUNTANT_PORTAL_PILLARS.length).toBe(5);
  });

  it("wires accountant-portal page to the polished panel", () => {
    const page = readFileSync(join(ROOT, ACCOUNTANT_PORTAL_PAGE_PATH), "utf8");
    expect(page).toContain("AccountantPortalPanel");
    expect(ACCOUNTANT_PORTAL_ROUTE).toBe("/dashboard/accounting/accountant-portal");
  });

  it("preserves accountant portal UI test ids and export wiring after polish", () => {
    const panel = readFileSync(join(ROOT, ACCOUNTANT_PORTAL_COMPONENT_PATH), "utf8");
    expect(panel).toContain('data-testid="accountant-portal-panel"');
    expect(panel).toContain('data-testid="accountant-portal-pillar"');
    expect(panel).toContain('data-testid="accountant-portal-deliverable"');
    expect(panel).toContain("AccountantPortalPanel");
    expect(panel).toContain("ACCOUNTANT_PORTAL_ONBOARDING");
    expect(panel).toContain("/api/export/gl-journal");
  });

  it("passes base accountant portal wiring audit after component polish", () => {
    const wiring = auditAccountantPortalWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes design polish slot 129 audit gate", () => {
    const audit = auditDesignFullPolishSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.polishTest).toBe(
      "tests/unit/absolute-final-design-full-polish-14-accountant-portal.test.ts",
    );
    expect(DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-design-polish-tokens-v1");
  });
});
