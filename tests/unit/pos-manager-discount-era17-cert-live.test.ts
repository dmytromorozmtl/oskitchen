import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  POS_MANAGER_DISCOUNT_ERA17_ACTION_MODULE,
  POS_MANAGER_DISCOUNT_ERA17_CANONICAL_DOC_PATHS,
  POS_MANAGER_DISCOUNT_ERA17_CANONICAL_MARKERS,
  POS_MANAGER_DISCOUNT_ERA17_CI_SCRIPTS,
  POS_MANAGER_DISCOUNT_ERA17_GUARD_MODULE,
  POS_MANAGER_DISCOUNT_ERA17_OPERATOR_DOC,
  POS_MANAGER_DISCOUNT_ERA17_POLICY_ID,
  POS_MANAGER_DISCOUNT_ERA17_REVIEW_SECTION,
  POS_MANAGER_DISCOUNT_ERA17_UNIT_TESTS,
} from "@/lib/pos/pos-manager-discount-era17-policy";

const ROOT = process.cwd();

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("POS manager discount era17 CI certification (live repo)", () => {
  it("locks era17 POS manager discount policy id", () => {
    expect(POS_MANAGER_DISCOUNT_ERA17_POLICY_ID).toBe("era17-pos-manager-discount-v1");
  });

  it("defines era17 POS manager discount cert scripts", () => {
    const scripts = readPackageScripts();
    for (const name of POS_MANAGER_DISCOUNT_ERA17_CI_SCRIPTS) {
      expect(scripts[name], `missing ${name}`).toBeTruthy();
    }
    expect(scripts["test:ci:pos-money-path:unit"]).toContain("pos-discount-guard.test.ts");
    expect(scripts["test:ci:pos-money-path:cert"]).toContain("pos-manager-discount-era17-cert-live");
  });

  it("wires pos-discount-guard into checkout action", () => {
    const action = readFileSync(join(ROOT, POS_MANAGER_DISCOUNT_ERA17_ACTION_MODULE), "utf8");
    expect(action).toContain("resolvePosDiscountGuard");
    expect(action).toContain("POS_DISCOUNT_APPLY_PERMISSION");
    expect(action).toContain("pos.checkout.discount");
    expect(existsSync(join(ROOT, POS_MANAGER_DISCOUNT_ERA17_GUARD_MODULE))).toBe(true);
  });

  it("documents era17 POS manager discount in canonical docs", () => {
    expect(existsSync(join(ROOT, POS_MANAGER_DISCOUNT_ERA17_OPERATOR_DOC))).toBe(true);
    for (const rel of POS_MANAGER_DISCOUNT_ERA17_CANONICAL_DOC_PATHS) {
      const text = readFileSync(join(ROOT, rel), "utf8").toLowerCase();
      expect(text, rel).toContain(POS_MANAGER_DISCOUNT_ERA17_POLICY_ID.toLowerCase());
    }
    const runbook = readFileSync(join(ROOT, "docs/commercial-pilot-runbook.md"), "utf8");
    expect(runbook).toContain(POS_MANAGER_DISCOUNT_ERA17_REVIEW_SECTION);
    for (const marker of POS_MANAGER_DISCOUNT_ERA17_CANONICAL_MARKERS) {
      expect(runbook.toLowerCase()).toContain(marker.toLowerCase());
    }
    const index = readFileSync(join(ROOT, "docs/canonical-doc-index.md"), "utf8");
    expect(index).toContain(POS_MANAGER_DISCOUNT_ERA17_POLICY_ID);
    for (const rel of POS_MANAGER_DISCOUNT_ERA17_UNIT_TESTS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });
});
