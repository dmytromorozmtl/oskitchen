import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditSalesAssetsPackage,
  formatSalesAssetsPackageAuditLines,
} from "@/lib/marketing/sales-assets-package-audit";
import {
  SALES_ASSETS_PACKAGE_ASSET_COUNT,
  SALES_ASSETS_PACKAGE_CI_WORKFLOW,
  SALES_ASSETS_PACKAGE_DOC,
  SALES_ASSETS_PACKAGE_ENTRIES,
  SALES_ASSETS_PACKAGE_NPM_SCRIPT,
  SALES_ASSETS_PACKAGE_POLICY_ID,
  SALES_ASSETS_PACKAGE_UNIT_TEST,
} from "@/lib/marketing/sales-assets-package-policy";

const ROOT = process.cwd();

describe("Sales assets package (P1-82)", () => {
  it("locks policy id and ten core sales assets", () => {
    expect(SALES_ASSETS_PACKAGE_POLICY_ID).toBe("sales-assets-package-p1-82-v1");
    expect(SALES_ASSETS_PACKAGE_ASSET_COUNT).toBe(10);
    expect(SALES_ASSETS_PACKAGE_ENTRIES).toHaveLength(10);
    expect(SALES_ASSETS_PACKAGE_ENTRIES.map((entry) => entry.id)).toEqual([
      "pitch_deck",
      "battle_cards",
      "roi_calculator",
      "loi",
      "demo_script",
      "pricing_sheet",
      "security_one_pager",
      "integration_list",
      "implementation_checklist",
      "case_study_template",
    ]);
  });

  it("passes full sales assets package audit", () => {
    const summary = auditSalesAssetsPackage(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.assetCountCorrect).toBe(true);
    expect(summary.allAssetsPresent).toBe(true);
    expect(summary.playbookWired).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("indexes pitch deck, battle cards, and ROI calculator paths", () => {
    const deck = SALES_ASSETS_PACKAGE_ENTRIES.find((entry) => entry.id === "pitch_deck");
    const battle = SALES_ASSETS_PACKAGE_ENTRIES.find((entry) => entry.id === "battle_cards");
    const roi = SALES_ASSETS_PACKAGE_ENTRIES.find((entry) => entry.id === "roi_calculator");
    expect(deck?.docPath).toBe("docs/sales-deck.md");
    expect(battle?.docPath).toBe("docs/competitive-battle-cards.md");
    expect(roi?.docPath).toBe("docs/roi-calculator-conservative.md");
    expect(existsSync(join(ROOT, "app/roi-calculator/page.tsx"))).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, SALES_ASSETS_PACKAGE_DOC))).toBe(true);
    expect(existsSync(join(ROOT, SALES_ASSETS_PACKAGE_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[SALES_ASSETS_PACKAGE_NPM_SCRIPT]).toContain(
      "audit-sales-assets-package.ts",
    );
    expect(pkg.scripts?.["test:ci:sales-assets-package"]).toContain(
      SALES_ASSETS_PACKAGE_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, SALES_ASSETS_PACKAGE_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:sales-assets-package");
  });

  it("formats audit lines", () => {
    const summary = auditSalesAssetsPackage(ROOT);
    const lines = formatSalesAssetsPackageAuditLines(summary);
    expect(lines.some((line) => line.includes(SALES_ASSETS_PACKAGE_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
