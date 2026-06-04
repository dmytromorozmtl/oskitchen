import { describe, expect, it } from "vitest";

import {
  auditPosRawPxCleanup,
  POS_RAW_PX_AUDIT_POLICY_ID,
  findPosRawPxViolations,
} from "@/lib/pos/pos-raw-px-audit-policy";
import {
  POS_PRODUCT_TILE_MIN_CLASS,
  POS_TABLE_MIN_WIDTH_CLASS,
  posProductTileLayoutClass,
} from "@/lib/pos/pos-spacing-tokens";
import { posTouchTileClass } from "@/lib/pos/touch-targets";
import { posCashierSpeedProductTileClass } from "@/lib/pos/pos-cashier-speed-mode-era19";

describe("POS raw px audit policy (DES-22)", () => {
  it("locks DES-22 policy id", () => {
    expect(POS_RAW_PX_AUDIT_POLICY_ID).toBe("pos-raw-px-audit-des22-v1");
  });

  it("detects forbidden arbitrary px classes", () => {
    const violations = findPosRawPxViolations(`
      <span className="text-[10px]">bad</span>
      <div className="min-h-[120px]">bad</div>
      <span className="text-xs">ok</span>
    `);
    expect(violations.map((v) => v.pattern)).toEqual(
      expect.arrayContaining(["text-[10px]", "min-h-[120px]"]),
    );
  });

  it("exposes spacing tokens for tiles and tables", () => {
    expect(POS_PRODUCT_TILE_MIN_CLASS).toBe("min-h-pos-tile");
    expect(POS_TABLE_MIN_WIDTH_CLASS).toBe("min-w-pos-table-min");
    expect(posTouchTileClass).toContain(POS_PRODUCT_TILE_MIN_CLASS);
    expect(posProductTileLayoutClass(false)).toContain("min-h-pos-tile");
    expect(posProductTileLayoutClass(true)).toContain("min-h-pos-tile-speed");
    expect(posCashierSpeedProductTileClass(true)).toContain("min-h-pos-tile-speed");
  });

  it("passes audit on all DES-22 POS modules (zero raw px)", () => {
    const report = auditPosRawPxCleanup();
    expect(report.passed).toBe(true);
    expect(report.modules.every((m) => m.violations.length === 0)).toBe(true);
  });
});
