import { readFileSync } from "node:fs";
import { join } from "node:path";

import { chartSeriesColors, colorVar } from "@/lib/design/color-tokens";

/**
 * DES-21 — color token audit policy (85% → 95% coverage on dashboard/chart surfaces).
 *
 * @see docs/color-token-audit.md
 * @see lib/design/color-tokens.ts
 * @see app/globals.css
 */

export const COLOR_TOKEN_AUDIT_POLICY_ID = "color-token-audit-des21-v1" as const;

export const COLOR_TOKEN_AUDIT_BASELINE_PERCENT = 85 as const;
export const COLOR_TOKEN_AUDIT_TARGET_PERCENT = 95 as const;

export const DES21_COLOR_TOKEN_MODULES = [
  "components/marketplace/vendor-dashboard-client.tsx",
  "components/marketplace/marketplace-analytics-charts.tsx",
  "components/platform/marketplace-analytics-admin-client.tsx",
  "components/marketing/landing-integration-health-moat.tsx",
  "components/analytics/profit-gauge.tsx",
  "components/dashboard/overview-charts.tsx",
  "components/dashboard/benchmark-dashboard.tsx",
  "components/purchasing/supplier-price-chart.tsx",
  "components/public/order-qr.tsx",
] as const;

const HEX_PATTERN = /#[0-9A-Fa-f]{3,8}\b/g;
const VAR_FALLBACK_PATTERN = /var\(--[a-z0-9-]+,\s*(#[0-9A-Fa-f]{3,8})\)/g;
const TOKEN_PATTERN =
  /var\(--color-[a-z0-9-]+(?:,\s*[^)]+)?\)|hsl\(var\(--[a-z-]+\)\)|colorVar\.|chartSeriesColor|chartSeriesColors|chartAxisChrome|integrationHealthStatusColors|marginGaugeGradientStops|benchmarkRadarColors|color-mix\(in srgb, var\(--color-/g;

export type ColorTokenModuleAudit = {
  module: (typeof DES21_COLOR_TOKEN_MODULES)[number];
  hardcodedHex: number;
  tokenReferences: number;
  coveragePercent: number;
  passed: boolean;
};

export type ColorTokenAuditReport = {
  policyId: typeof COLOR_TOKEN_AUDIT_POLICY_ID;
  baselinePercent: typeof COLOR_TOKEN_AUDIT_BASELINE_PERCENT;
  targetPercent: typeof COLOR_TOKEN_AUDIT_TARGET_PERCENT;
  overallCoveragePercent: number;
  modules: ColorTokenModuleAudit[];
  passed: boolean;
};

function stripVarFallbacks(source: string): string {
  return source.replace(VAR_FALLBACK_PATTERN, "var(--token)");
}

export function countColorUsage(source: string): { hardcodedHex: number; tokenReferences: number } {
  const sanitized = stripVarFallbacks(source);
  const hardcodedHex = (sanitized.match(HEX_PATTERN) ?? []).length;
  const tokenReferences = (source.match(TOKEN_PATTERN) ?? []).length;
  return { hardcodedHex, tokenReferences };
}

export function coveragePercent(hardcodedHex: number, tokenReferences: number): number {
  const total = hardcodedHex + tokenReferences;
  if (total === 0) return 100;
  return Math.round((tokenReferences / total) * 1000) / 10;
}

export function auditColorTokenModule(
  modulePath: (typeof DES21_COLOR_TOKEN_MODULES)[number],
  root = process.cwd(),
): ColorTokenModuleAudit {
  const source = readFileSync(join(root, modulePath), "utf8");
  const { hardcodedHex, tokenReferences } = countColorUsage(source);
  const moduleCoverage = coveragePercent(hardcodedHex, tokenReferences);
  return {
    module: modulePath,
    hardcodedHex,
    tokenReferences,
    coveragePercent: moduleCoverage,
    passed: hardcodedHex === 0 && moduleCoverage >= COLOR_TOKEN_AUDIT_TARGET_PERCENT,
  };
}

export function auditDes21ColorTokenCoverage(root = process.cwd()): ColorTokenAuditReport {
  const modules = DES21_COLOR_TOKEN_MODULES.map((modulePath) => auditColorTokenModule(modulePath, root));
  const totalHardcoded = modules.reduce((sum, m) => sum + m.hardcodedHex, 0);
  const totalTokens = modules.reduce((sum, m) => sum + m.tokenReferences, 0);
  const overallCoveragePercent = coveragePercent(totalHardcoded, totalTokens);

  return {
    policyId: COLOR_TOKEN_AUDIT_POLICY_ID,
    baselinePercent: COLOR_TOKEN_AUDIT_BASELINE_PERCENT,
    targetPercent: COLOR_TOKEN_AUDIT_TARGET_PERCENT,
    overallCoveragePercent,
    modules,
    passed:
      overallCoveragePercent >= COLOR_TOKEN_AUDIT_TARGET_PERCENT &&
      modules.every((m) => m.hardcodedHex === 0),
  };
}

export function expectedChartPaletteLength(): number {
  return chartSeriesColors.length;
}

export function canonicalAccentToken(): string {
  return colorVar.accent;
}
