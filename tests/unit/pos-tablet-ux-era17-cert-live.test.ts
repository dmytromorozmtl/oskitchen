import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  POS_TABLET_UX_ERA17_CANONICAL_DOC_PATHS,
  POS_TABLET_UX_ERA17_CANONICAL_MARKERS,
  POS_TABLET_UX_ERA17_CI_SCRIPTS,
  POS_TABLET_UX_ERA17_OPERATOR_DOC,
  POS_TABLET_UX_ERA17_ORCHESTRATOR_SCRIPT,
  POS_TABLET_UX_ERA17_POLICY_ID,
  POS_TABLET_UX_ERA17_REVIEW_SECTION,
  POS_TABLET_UX_ERA17_TERMINAL_MODULE,
  POS_TABLET_UX_ERA17_UNIT_TESTS,
} from "@/lib/pos/pos-tablet-ux-era17-policy";
import { POS_TOUCH_TARGET_CONSUMERS } from "@/lib/pos/touch-targets";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("POS tablet UX era17 CI certification (live repo)", () => {
  it("locks era17 POS tablet UX policy id", () => {
    expect(POS_TABLET_UX_ERA17_POLICY_ID).toBe("era17-pos-tablet-ux-v1");
  });

  it("defines era17 POS tablet UX scripts", () => {
    const scripts = readPackageScripts();
    expect(scripts["smoke:pos-tablet-ux"]).toContain(POS_TABLET_UX_ERA17_ORCHESTRATOR_SCRIPT);
    for (const name of POS_TABLET_UX_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:pos-money-path:cert"]).toContain("pos-tablet-ux-era17-cert-live");
  });

  it("wires touch targets and checkout status into terminal client", () => {
    const terminal = readFileSync(join(ROOT, POS_TABLET_UX_ERA17_TERMINAL_MODULE), "utf8");
    expect(terminal).toContain("posCheckoutStatusClassName");
    expect(terminal).toContain("posTouchCompactClass");
    expect(terminal).toContain("posCheckoutButtonClass");
    expect(terminal).toContain('data-testid="pos-checkout-status"');
    expect(terminal).toContain("onError");

    for (const rel of POS_TOUCH_TARGET_CONSUMERS) {
      const source = readFileSync(join(ROOT, rel), "utf8");
      expect(source, rel).toMatch(/posTouch(Button|Compact|Tile)Class/);
    }

    const terminalPage = readFileSync(join(ROOT, "app/dashboard/pos/terminal/page.tsx"), "utf8");
    expect(terminalPage).toContain("PermissionDeniedSurfaceCard");
  });

  it("documents era17 POS tablet UX in canonical docs", () => {
    expect(existsSync(join(ROOT, POS_TABLET_UX_ERA17_OPERATOR_DOC))).toBe(true);
    expect(existsSync(join(ROOT, POS_TABLET_UX_ERA17_ORCHESTRATOR_SCRIPT))).toBe(true);
    for (const rel of POS_TABLET_UX_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(POS_TABLET_UX_ERA17_POLICY_ID.toLowerCase());
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(POS_TABLET_UX_ERA17_REVIEW_SECTION);
    for (const marker of POS_TABLET_UX_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(POS_TABLET_UX_ERA17_POLICY_ID);
    for (const rel of POS_TABLET_UX_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
