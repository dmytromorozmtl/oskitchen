import { buildFranchiseSuiteDashboardV2 } from "@/lib/enterprise/franchise-suite-2-builders";
import type {
  FranchiseBrandStatus,
  FranchiseMenuEnforcement,
  FranchiseSuiteDashboard,
  FranchiseSuiteSettings,
  FranchiseUnitRow,
} from "@/lib/enterprise/franchise-types";
import type { calculateRoyalties } from "@/services/franchise/franchise-service";

export function normalizeMenuItemName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function evaluateMenuCompliance(input: {
  requiredItems: string[];
  franchiseeProductNames: string[];
}): { percent: number; missing: string[] } {
  const required = [...new Set(input.requiredItems.map(normalizeMenuItemName).filter(Boolean))];
  if (required.length === 0) {
    return { percent: 100, missing: [] };
  }

  const available = new Set(input.franchiseeProductNames.map(normalizeMenuItemName));
  const missing = input.requiredItems.filter((item) => !available.has(normalizeMenuItemName(item)));
  const percent = Math.round(((required.length - missing.length) / required.length) * 100);
  return { percent: Math.max(0, Math.min(100, percent)), missing };
}

export function resolveBrandStatus(
  menuCompliancePercent: number,
  enforcement: FranchiseMenuEnforcement,
): FranchiseBrandStatus {
  const threshold = enforcement.mode === "strict" ? 95 : 80;
  if (menuCompliancePercent >= threshold) return "compliant";
  if (menuCompliancePercent >= threshold - 15) return "review";
  return "non_compliant";
}

export function buildFranchiseUnitRows(input: {
  royalties: Awaited<ReturnType<typeof calculateRoyalties>>;
  productNamesByFranchisee: Map<string, string[]>;
  settings: FranchiseSuiteSettings;
  canonicalMenuItems: string[];
}): FranchiseUnitRow[] {
  const requiredItems =
    input.settings.menuEnforcement.lockedMenuItems.length > 0
      ? input.settings.menuEnforcement.lockedMenuItems
      : input.canonicalMenuItems;

  return input.royalties.franchises.map((row) => {
    const franchiseeProducts = input.productNamesByFranchisee.get(row.franchiseeId) ?? [];
    const { percent, missing } = evaluateMenuCompliance({
      requiredItems,
      franchiseeProductNames: franchiseeProducts,
    });

    return {
      franchiseId: row.franchiseId,
      franchiseName: row.franchiseName,
      franchiseeId: row.franchiseeId,
      status: "ACTIVE",
      royaltyRate: row.royaltyRate,
      totalRevenue: row.totalRevenue,
      royaltyAmount: row.royaltyAmount,
      menuCompliancePercent: percent,
      missingMenuItems: missing.slice(0, 6),
      brandStatus: resolveBrandStatus(percent, input.settings.menuEnforcement),
    };
  });
}

export function buildFranchiseSuiteDashboard(input: {
  workspaceId: string;
  royalties: Awaited<ReturnType<typeof calculateRoyalties>>;
  settings: FranchiseSuiteSettings;
  units: FranchiseUnitRow[];
  analyzedAt?: string;
}): FranchiseSuiteDashboard {
  const complianceValues = input.units.map((u) => u.menuCompliancePercent);
  const averageMenuCompliance =
    complianceValues.length > 0
      ? Math.round(complianceValues.reduce((s, v) => s + v, 0) / complianceValues.length)
      : 100;

  return {
    workspaceId: input.workspaceId,
    analyzedAt: input.analyzedAt ?? new Date().toISOString(),
    period: input.royalties.period,
    since: input.royalties.since,
    royalties: input.royalties,
    brandControl: input.settings.brandControl,
    menuEnforcement: {
      ...input.settings.menuEnforcement,
      requiredItemCount:
        input.settings.menuEnforcement.lockedMenuItems.length > 0
          ? input.settings.menuEnforcement.lockedMenuItems.length
          : input.settings.menuEnforcement.requiredItemCount,
    },
    units: input.units,
    summary: {
      franchiseCount: input.units.length,
      totalRoyalties: input.royalties.totalRoyalties,
      averageMenuCompliance,
      unitsNeedingReview: input.units.filter((u) => u.brandStatus !== "compliant").length,
    },
    v2: buildFranchiseSuiteDashboardV2({
      units: input.units,
      totalRoyalties: input.royalties.totalRoyalties,
      hasBrandKit: Boolean(
        input.settings.brandControl.brandName ||
          input.settings.brandControl.logoUrl ||
          input.settings.brandControl.brandColor,
      ),
    }),
  };
}
