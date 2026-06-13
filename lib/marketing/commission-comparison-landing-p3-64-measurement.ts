import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { auditCommissionComparisonLandingWiring } from "@/lib/marketing/commission-comparison-landing-audit";
import { auditCommissionComparisonCalculatorP2_46 } from "@/lib/marketing/commission-comparison-calculator-p2-46-audit";
import {
  COMMISSION_COMPARISON_LANDING_P3_64_CANONICAL_PATH,
  commissionComparisonLandingPathsAligned,
} from "@/lib/marketing/commission-comparison-landing-p3-64-policy";

export type CommissionComparisonLandingContractValidation = {
  passed: boolean;
  pathsAligned: boolean;
  sitemapWired: boolean;
  upstreamP2_46Ok: boolean;
  upstreamAuditOk: boolean;
  failures: string[];
};

export function validateCommissionComparisonLandingContract(
  root = process.cwd(),
): CommissionComparisonLandingContractValidation {
  const failures: string[] = [];

  if (!commissionComparisonLandingPathsAligned()) {
    failures.push(
      "commission-comparison landing path constants are not aligned to /commission-comparison",
    );
  }

  let sitemapWired = false;
  const sitemapPath = join(root, "lib/marketing/sitemap-urls.ts");
  if (!existsSync(sitemapPath)) {
    failures.push("missing sitemap-urls.ts");
  } else {
    const source = readFileSync(sitemapPath, "utf8");
    sitemapWired = source.includes(COMMISSION_COMPARISON_LANDING_P3_64_CANONICAL_PATH);
    if (!sitemapWired) {
      failures.push(
        `${COMMISSION_COMPARISON_LANDING_P3_64_CANONICAL_PATH} missing from sitemap-urls.ts`,
      );
    }
  }

  const upstream = auditCommissionComparisonLandingWiring(root);
  if (!upstream.ok) {
    failures.push(...upstream.failures);
  }

  const p2_46 = auditCommissionComparisonCalculatorP2_46(root);
  if (!p2_46.passed) {
    failures.push("P2-46 DoorDash calculator upstream audit failed");
  }

  return {
    passed: failures.length === 0 && commissionComparisonLandingPathsAligned() && upstream.ok && p2_46.passed,
    pathsAligned: commissionComparisonLandingPathsAligned(),
    sitemapWired,
    upstreamP2_46Ok: p2_46.passed,
    upstreamAuditOk: upstream.ok,
    failures,
  };
}
