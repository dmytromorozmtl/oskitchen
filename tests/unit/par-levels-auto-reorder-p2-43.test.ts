import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditParLevelsAutoReorderP2_43,
  formatParLevelsAutoReorderP2_43AuditLines,
} from "@/lib/inventory/par-levels-auto-reorder-p2-43-audit";
import {
  computeParGapQuantity,
  isBelowParLevel,
  suggestParReplenishmentQuantity,
} from "@/lib/inventory/par-levels-auto-reorder-p2-43-measurement";
import {
  PAR_LEVELS_AUTO_REORDER_P2_43_AUDIT_SCRIPT,
  PAR_LEVELS_AUTO_REORDER_P2_43_CHECK_NPM_SCRIPT,
  PAR_LEVELS_AUTO_REORDER_P2_43_CI_WORKFLOW,
  PAR_LEVELS_AUTO_REORDER_P2_43_DOC,
  PAR_LEVELS_AUTO_REORDER_P2_43_NPM_SCRIPT,
  PAR_LEVELS_AUTO_REORDER_P2_43_POLICY_ID,
  PAR_LEVELS_AUTO_REORDER_P2_43_UNIT_TEST,
} from "@/lib/inventory/par-levels-auto-reorder-p2-43-policy";

const ROOT = process.cwd();

describe("Par levels + auto-reorder (P2-43)", () => {
  it("locks policy id and par replenishment math", () => {
    expect(PAR_LEVELS_AUTO_REORDER_P2_43_POLICY_ID).toBe("par-levels-auto-reorder-p2-43-v1");
    expect(isBelowParLevel({ currentStock: 8, parLevel: 10 })).toBe(true);
    expect(isBelowParLevel({ currentStock: 12, parLevel: 10 })).toBe(false);
    expect(isBelowParLevel({ currentStock: 5, parLevel: 0 })).toBe(false);
    expect(computeParGapQuantity({ currentStock: 3, parLevel: 10 })).toBe(7);
    expect(
      suggestParReplenishmentQuantity({ currentStock: 3, parLevel: 10, reorderPoint: 5 }),
    ).toBe(7);
  });

  it("passes full par levels auto-reorder audit", () => {
    const summary = auditParLevelsAutoReorderP2_43(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.actionsWired).toBe(true);
    expect(summary.reorderPageWired).toBe(true);
    expect(summary.purchasingPageWired).toBe(true);
    expect(summary.goldenParMathOk).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
    expect(formatParLevelsAutoReorderP2_43AuditLines(summary).length).toBeGreaterThan(5);
  });

  it("registers audit script and npm wiring", () => {
    expect(existsSync(join(ROOT, PAR_LEVELS_AUTO_REORDER_P2_43_DOC))).toBe(true);
    expect(existsSync(join(ROOT, PAR_LEVELS_AUTO_REORDER_P2_43_AUDIT_SCRIPT))).toBe(true);
    expect(existsSync(join(ROOT, PAR_LEVELS_AUTO_REORDER_P2_43_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[PAR_LEVELS_AUTO_REORDER_P2_43_NPM_SCRIPT]).toContain(
      "audit-par-levels-auto-reorder-p2-43.ts",
    );
    expect(pkg.scripts?.[PAR_LEVELS_AUTO_REORDER_P2_43_CHECK_NPM_SCRIPT]).toContain(
      PAR_LEVELS_AUTO_REORDER_P2_43_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, PAR_LEVELS_AUTO_REORDER_P2_43_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("par-levels-auto-reorder-p2-43");
  });
});
