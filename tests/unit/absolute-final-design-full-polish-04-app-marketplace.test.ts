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
import { auditAppMarketplaceThirdPartyWiring } from "@/lib/platform/app-marketplace-third-party-audit";
import {
  APP_MARKETPLACE_THIRD_PARTY_COMPONENT_PATH,
  APP_MARKETPLACE_THIRD_PARTY_HONESTY_MARKERS,
  APP_MARKETPLACE_THIRD_PARTY_PAGE_PATH,
} from "@/lib/platform/app-marketplace-third-party-absolute-final-policy";
import {
  APP_MARKETPLACE_THIRD_PARTY_EXTENSIONS,
  APP_MARKETPLACE_THIRD_PARTY_HONESTY_NOTE,
} from "@/lib/platform/app-marketplace-third-party-content";

const ROOT = process.cwd();
/** Absolute Final Task 119 — Design full polish for feature 89 app marketplace 3rd party */
const TASK = 119;
const FEATURE = 89;

describe(`Design full polish — app marketplace (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks design polish registry slot 119 → feature 89 app marketplace", () => {
    expect(DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-design-full-polish-v1",
    );
    const slot = getDesignFullPolishSlot(TASK);
    expect(slot?.featureKey).toBe("app-marketplace-third-party");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetKind).toBe("component");
    expect(slot?.targetPath).toBe(APP_MARKETPLACE_THIRD_PARTY_COMPONENT_PATH);
  });

  it("applies design polish card, hero, and row tokens to the marketplace component", () => {
    const component = readFileSync(join(ROOT, APP_MARKETPLACE_THIRD_PARTY_COMPONENT_PATH), "utf8");
    for (const token of DESIGN_POLISH_TOKEN_NAMES) {
      expect(component, `missing ${token}`).toContain(token);
    }
    expect(component).toContain("absolute-final-design-polish-tokens");
    expect(component).toContain("DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID");
  });

  it("includes dark mode polish tokens on table and hero surfaces", () => {
    const component = readFileSync(join(ROOT, APP_MARKETPLACE_THIRD_PARTY_COMPONENT_PATH), "utf8");
    const tokens = readFileSync(
      join(ROOT, "lib/design/absolute-final-design-polish-tokens.ts"),
      "utf8",
    );
    expect(component).toContain("dark:text-muted-foreground/90");
    expect(component).toContain("dark:border-border/50");
    expect(component).toContain("dark:bg-muted/20");
    expect(tokens).toContain(DESIGN_POLISH_DARK_MODE_TOKENS[0]);
  });

  it("shows hero banner with platform review and self-serve honesty", () => {
    const component = readFileSync(join(ROOT, APP_MARKETPLACE_THIRD_PARTY_COMPONENT_PATH), "utf8");
    const content = readFileSync(
      join(ROOT, "lib/platform/app-marketplace-third-party-content.ts"),
      "utf8",
    );
    const combined = `${component}\n${content}\n${APP_MARKETPLACE_THIRD_PARTY_HONESTY_NOTE}`;
    expect(component).toContain("APP_MARKETPLACE_THIRD_PARTY_HONESTY_NOTE");
    expect(component).toContain("platform review");
    expect(component).toContain("not a self-serve");
    expect(component).toContain('role="note"');
    for (const marker of APP_MARKETPLACE_THIRD_PARTY_HONESTY_MARKERS) {
      expect(
        combined.includes(marker) || combined.toLowerCase().includes(marker.toLowerCase()),
      ).toBe(true);
    }
  });

  it("wires marketing page to the polished marketplace component", () => {
    const page = readFileSync(join(ROOT, APP_MARKETPLACE_THIRD_PARTY_PAGE_PATH), "utf8");
    expect(page).toContain("AppMarketplaceThirdParty");
    expect(APP_MARKETPLACE_THIRD_PARTY_EXTENSIONS.length).toBe(8);
  });

  it("preserves extension row data-testid pattern after polish", () => {
    const component = readFileSync(join(ROOT, APP_MARKETPLACE_THIRD_PARTY_COMPONENT_PATH), "utf8");
    expect(component).toContain('data-testid="app-marketplace-third-party"');
    expect(component).toContain("app-marketplace-extension-${ext.id}");
    expect(component).toContain("APP_MARKETPLACE_THIRD_PARTY_EXTENSIONS.map");
  });

  it("passes base app marketplace wiring audit after component polish", () => {
    const wiring = auditAppMarketplaceThirdPartyWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes design polish slot 119 audit gate", () => {
    const audit = auditDesignFullPolishSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.polishTest).toBe(
      "tests/unit/absolute-final-design-full-polish-04-app-marketplace.test.ts",
    );
  });
});
