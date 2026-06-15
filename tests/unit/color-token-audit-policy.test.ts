import { describe, expect, it } from "vitest";

import {
  auditDes21ColorTokenCoverage,
  COLOR_TOKEN_AUDIT_BASELINE_PERCENT,
  COLOR_TOKEN_AUDIT_POLICY_ID,
  COLOR_TOKEN_AUDIT_TARGET_PERCENT,
  countColorUsage,
  coveragePercent,
} from "@/lib/design/color-token-audit-policy";
import { chartSeriesColors, colorVar } from "@/lib/design/color-tokens";

describe("color token audit policy (DES-21)", () => {
  it("locks DES-21 policy id and coverage thresholds", () => {
    expect(COLOR_TOKEN_AUDIT_POLICY_ID).toBe("color-token-audit-des21-v1");
    expect(COLOR_TOKEN_AUDIT_BASELINE_PERCENT).toBe(85);
    expect(COLOR_TOKEN_AUDIT_TARGET_PERCENT).toBe(95);
  });

  it("ignores hex fallbacks inside var() when counting hardcoded colors", () => {
    const sample = `
      stroke="var(--color-accent, #FF5F1F)"
      fill={colorVar.success}
      bad="#abc123"
    `;
    const { hardcodedHex, tokenReferences } = countColorUsage(sample);
    expect(hardcodedHex).toBe(1);
    expect(tokenReferences).toBeGreaterThanOrEqual(2);
    expect(coveragePercent(hardcodedHex, tokenReferences)).toBeGreaterThanOrEqual(66);
  });

  it("exposes canonical chart palette from CSS variables", () => {
    expect(chartSeriesColors[0]).toBe(colorVar.accent);
    expect(chartSeriesColors.every((c) => c.startsWith("var(") || c.startsWith("hsl("))).toBe(true);
  });

  it("meets 95% token coverage across DES-21 chart/dashboard modules", () => {
    const report = auditDes21ColorTokenCoverage();
    expect(report.overallCoveragePercent).toBeGreaterThanOrEqual(COLOR_TOKEN_AUDIT_TARGET_PERCENT);
    expect(report.passed).toBe(true);
    expect(report.modules.every((m) => m.hardcodedHex === 0)).toBe(true);
  });
});
