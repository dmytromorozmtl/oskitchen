import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  INVENTORY_DEPLETION_FORBIDDEN_GTM_PHRASES,
  INVENTORY_DEPLETION_GTM_LOCK_ID,
  INVENTORY_DEPLETION_GTM_REQUIRED_MARKERS,
  INVENTORY_DEPLETION_NON_DEPLETING_ENTRYPOINTS,
  INVENTORY_DEPLETION_STOREFRONT_HOOK_STATUS,
} from "@/lib/inventory/inventory-depletion-policy";

const ROOT = process.cwd();

const GTM_DOCS = [
  "docs/product-positioning.md",
  "docs/feature-maturity-matrix.md",
  "docs/competitor-feature-gap-matrix.md",
] as const;

function readPackageScripts(): Record<string, string> {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  return pkg.scripts ?? {};
}

describe("inventory depletion GTM lock certification (live repo)", () => {
  it("locks era5 permanent POS-only GTM deferral", () => {
    expect(INVENTORY_DEPLETION_GTM_LOCK_ID).toBe("era5-pos-only-gtm-lock-v1");
    expect(INVENTORY_DEPLETION_STOREFRONT_HOOK_STATUS).toBe("deferred_locked");
  });

  it("keeps non-certified order entrypoints free of POS depletion hooks", () => {
    for (const rel of INVENTORY_DEPLETION_NON_DEPLETING_ENTRYPOINTS) {
      const path = join(ROOT, rel);
      expect(existsSync(path), `missing ${rel}`).toBe(true);
      const source = readFileSync(path, "utf8");
      expect(source, rel).not.toContain("recordPendingInventoryImpactsForPosOrder");
      expect(source, rel).not.toContain("applyRecipeDepletionForPosLine");
    }
  });

  it("documents GTM lock markers in canonical sales docs", () => {
    for (const rel of GTM_DOCS) {
      const text = readFileSync(join(ROOT, rel), "utf8");
      for (const marker of INVENTORY_DEPLETION_GTM_REQUIRED_MARKERS) {
        expect(text, `${rel} missing ${marker}`).toContain(marker);
      }
      for (const phrase of INVENTORY_DEPLETION_FORBIDDEN_GTM_PHRASES) {
        expect(text, `${rel} contains forbidden "${phrase}"`).not.toContain(phrase);
      }
    }
  });

  it("includes GTM lock cert in inventory-depletion CI bundle", () => {
    const scripts = readPackageScripts();
    expect(scripts["test:ci:inventory-depletion:cert"]).toContain(
      "inventory-depletion-gtm-lock-cert-live.test.ts",
    );
  });
});
