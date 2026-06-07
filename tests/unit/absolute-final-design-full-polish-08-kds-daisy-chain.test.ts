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
import { auditKdsDaisyChainConfigWiring } from "@/lib/kitchen/kds-daisy-chain-config-audit";
import {
  KDS_DAISY_CHAIN_CONFIG_ALOHA_PARITY_PILLARS,
  KDS_DAISY_CHAIN_CONFIG_PAGE_PATH,
  KDS_DAISY_CHAIN_CONFIG_PANEL_PATH,
  KDS_DAISY_CHAIN_CONFIG_ROUTE,
} from "@/lib/kitchen/kds-daisy-chain-config-absolute-final-policy";

const ROOT = process.cwd();
/** Absolute Final Task 123 — Design full polish for feature 93 KDS daisy-chain config */
const TASK = 123;
const FEATURE = 93;

const KDS_DAISY_CHAIN_HONESTY_MARKERS = [
  "NCR Aloha parity",
  "BETA",
  "bump handoff",
  "settingsCenterJson",
  "proprietary",
  "terminal hub sync",
] as const;

describe(`Design full polish — KDS daisy-chain (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks design polish registry slot 123 → feature 93 KDS daisy-chain config", () => {
    expect(DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-design-full-polish-v1",
    );
    const slot = getDesignFullPolishSlot(TASK);
    expect(slot?.featureKey).toBe("kds-daisy-chain-config");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetKind).toBe("component");
    expect(slot?.targetPath).toBe(KDS_DAISY_CHAIN_CONFIG_PANEL_PATH);
  });

  it("applies design polish card, hero, and row tokens to the daisy-chain panel", () => {
    const panel = readFileSync(join(ROOT, KDS_DAISY_CHAIN_CONFIG_PANEL_PATH), "utf8");
    for (const token of DESIGN_POLISH_TOKEN_NAMES) {
      expect(panel, `missing ${token}`).toContain(token);
    }
    expect(panel).toContain("absolute-final-design-polish-tokens");
    expect(panel).toContain("DESIGN_POLISH_STRIPE_OK_CLASS");
    expect(panel).toContain("DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID");
  });

  it("includes dark mode polish tokens on tables and hero surfaces", () => {
    const panel = readFileSync(join(ROOT, KDS_DAISY_CHAIN_CONFIG_PANEL_PATH), "utf8");
    const tokens = readFileSync(
      join(ROOT, "lib/design/absolute-final-design-polish-tokens.ts"),
      "utf8",
    );
    expect(panel).toContain("dark:text-muted-foreground/90");
    expect(panel).toContain("dark:border-border/50");
    expect(tokens).toContain(DESIGN_POLISH_DARK_MODE_TOKENS[0]);
  });

  it("shows hero banner with NCR Aloha parity and bump handoff honesty", () => {
    const panel = readFileSync(join(ROOT, KDS_DAISY_CHAIN_CONFIG_PANEL_PATH), "utf8");
    for (const marker of KDS_DAISY_CHAIN_HONESTY_MARKERS) {
      expect(panel).toContain(marker);
    }
    expect(panel).toContain('role="note"');
    expect(KDS_DAISY_CHAIN_CONFIG_ALOHA_PARITY_PILLARS.length).toBe(5);
  });

  it("wires daisy-chain page to the polished config panel", () => {
    const page = readFileSync(join(ROOT, KDS_DAISY_CHAIN_CONFIG_PAGE_PATH), "utf8");
    expect(page).toContain("KdsDaisyChainConfigPanel");
    expect(KDS_DAISY_CHAIN_CONFIG_ROUTE).toBe("/dashboard/kitchen/daisy-chain");
  });

  it("preserves daisy-chain UI test ids after polish", () => {
    const panel = readFileSync(join(ROOT, KDS_DAISY_CHAIN_CONFIG_PANEL_PATH), "utf8");
    expect(panel).toContain('data-testid="kds-daisy-chain-config-panel"');
    expect(panel).toContain('data-testid="kds-daisy-chain-path"');
    expect(panel).toContain('data-testid="kds-daisy-chain-link-row"');
    expect(panel).toContain('data-testid="kds-daisy-chain-bump-preview-row"');
    expect(panel).toContain("toggleKdsDaisyChainLinkAction");
    expect(panel).toContain("/dashboard/kitchen/routing-rules");
  });

  it("passes base KDS daisy-chain wiring audit after component polish", () => {
    const wiring = auditKdsDaisyChainConfigWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes design polish slot 123 audit gate", () => {
    const audit = auditDesignFullPolishSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.polishTest).toBe(
      "tests/unit/absolute-final-design-full-polish-08-kds-daisy-chain.test.ts",
    );
    expect(DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-design-polish-tokens-v1");
  });
});
