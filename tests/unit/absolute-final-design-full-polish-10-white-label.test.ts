import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

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
import { auditWhiteLabelStorefrontDepthWiring } from "@/lib/storefront/white-label-storefront-depth-audit";
import {
  WHITE_LABEL_STOREFRONT_DEPTH_CHOWNOW_PARITY_PILLARS,
  WHITE_LABEL_STOREFRONT_DEPTH_COMPONENT_PATH,
  WHITE_LABEL_STOREFRONT_DEPTH_HONESTY_MARKERS,
  WHITE_LABEL_STOREFRONT_DEPTH_PAGE_PATH,
  WHITE_LABEL_STOREFRONT_DEPTH_ROUTE,
} from "@/lib/storefront/white-label-storefront-depth-absolute-final-policy";

const ROOT = process.cwd();
/** Absolute Final Task 125 — Design full polish for feature 95 white-label storefront depth */
const TASK = 125;
const FEATURE = 95;

describe(`Design full polish — white-label storefront (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks design polish registry slot 125 → feature 95 white-label storefront depth", () => {
    expect(DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-design-full-polish-v1",
    );
    const slot = getDesignFullPolishSlot(TASK);
    expect(slot?.featureKey).toBe("white-label-storefront-depth");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetKind).toBe("component");
    expect(slot?.targetPath).toBe(WHITE_LABEL_STOREFRONT_DEPTH_COMPONENT_PATH);
  });

  it("applies design polish card, hero, and row tokens to the white-label panel", () => {
    const panel = readFileSync(join(ROOT, WHITE_LABEL_STOREFRONT_DEPTH_COMPONENT_PATH), "utf8");
    for (const token of DESIGN_POLISH_TOKEN_NAMES) {
      expect(panel, `missing ${token}`).toContain(token);
    }
    expect(panel).toContain("absolute-final-design-polish-tokens");
    expect(panel).toContain("DESIGN_POLISH_STRIPE_OK_CLASS");
    expect(panel).toContain("DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID");
  });

  it("includes dark mode polish tokens on cards and capability rows", () => {
    const panel = readFileSync(join(ROOT, WHITE_LABEL_STOREFRONT_DEPTH_COMPONENT_PATH), "utf8");
    const tokens = readFileSync(
      join(ROOT, "lib/design/absolute-final-design-polish-tokens.ts"),
      "utf8",
    );
    expect(panel).toContain("dark:text-muted-foreground/90");
    expect(panel).toContain("dark:border-border/50");
    expect(tokens).toContain(DESIGN_POLISH_DARK_MODE_TOKENS[0]);
  });

  it("shows hero banner with ChowNow parity and DNS honesty markers", () => {
    const panel = readFileSync(join(ROOT, WHITE_LABEL_STOREFRONT_DEPTH_COMPONENT_PATH), "utf8");
    for (const marker of WHITE_LABEL_STOREFRONT_DEPTH_HONESTY_MARKERS) {
      expect(panel).toContain(marker);
    }
    expect(panel).toContain('role="note"');
    expect(WHITE_LABEL_STOREFRONT_DEPTH_CHOWNOW_PARITY_PILLARS.length).toBe(5);
  });

  it("wires white-label page to the polished depth panel", () => {
    const page = readFileSync(join(ROOT, WHITE_LABEL_STOREFRONT_DEPTH_PAGE_PATH), "utf8");
    expect(page).toContain("WhiteLabelStorefrontDepthPanel");
    expect(WHITE_LABEL_STOREFRONT_DEPTH_ROUTE).toBe("/dashboard/storefront/white-label");
  });

  it("preserves white-label UI test ids after polish", () => {
    const panel = readFileSync(join(ROOT, WHITE_LABEL_STOREFRONT_DEPTH_COMPONENT_PATH), "utf8");
    expect(panel).toContain('data-testid="white-label-storefront-depth-panel"');
    expect(panel).toContain('data-testid="white-label-depth-capability"');
    expect(panel).toContain('data-testid="white-label-depth-pillar"');
    expect(panel).toContain("WhiteLabelStorefrontDepthPanel");
    expect(panel).toContain("CapabilityRow");
  });

  it("passes base white-label storefront depth wiring audit after component polish", () => {
    const wiring = auditWhiteLabelStorefrontDepthWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes design polish slot 125 audit gate", () => {
    const audit = auditDesignFullPolishSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.polishTest).toBe(
      "tests/unit/absolute-final-design-full-polish-10-white-label.test.ts",
    );
    expect(DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-design-polish-tokens-v1");
  });
});
