import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  COMMISSION_COMPARISON_CALCULATOR_COMPONENT_PATH,
  COMMISSION_COMPARISON_CALCULATOR_CONTENT_PATH,
  COMMISSION_COMPARISON_CALCULATOR_PAGE_PATH,
  COMMISSION_COMPARISON_CALCULATOR_ROUTE,
  COMMISSION_COMPARISON_DASHBOARD_ROUTE,
  COMMISSION_COMPARISON_HONESTY_MARKERS,
  COMMISSION_COMPARISON_PRICING_PAGE_PATH,
  COMMISSION_COMPARISON_REQUIRED_MARKERS,
  COMMISSION_COMPARISON_UPSTREAM_POLICY,
  COMMISSION_COMPARISON_WIRING_PATHS,
} from "@/lib/marketing/commission-comparison-calculator-absolute-final-policy";

export type CommissionComparisonCalculatorAudit = {
  ok: boolean;
  failures: string[];
};

export function auditCommissionComparisonCalculatorWiring(
  root = process.cwd(),
): CommissionComparisonCalculatorAudit {
  const failures: string[] = [];

  for (const rel of COMMISSION_COMPARISON_WIRING_PATHS) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const componentSource = readFileSync(
    join(root, COMMISSION_COMPARISON_CALCULATOR_COMPONENT_PATH),
    "utf8",
  );
  const contentSource = readFileSync(
    join(root, COMMISSION_COMPARISON_CALCULATOR_CONTENT_PATH),
    "utf8",
  );
  const pageSource = readFileSync(
    join(root, COMMISSION_COMPARISON_CALCULATOR_PAGE_PATH),
    "utf8",
  );
  const pricingSource = readFileSync(join(root, COMMISSION_COMPARISON_PRICING_PAGE_PATH), "utf8");
  const upstreamSource = readFileSync(join(root, COMMISSION_COMPARISON_UPSTREAM_POLICY), "utf8");

  for (const marker of COMMISSION_COMPARISON_REQUIRED_MARKERS) {
    if (!componentSource.includes(marker)) {
      failures.push(`calculator component missing marker: ${marker}`);
    }
  }

  for (const marker of COMMISSION_COMPARISON_HONESTY_MARKERS) {
    if (!componentSource.includes(marker) && !contentSource.includes(marker)) {
      failures.push(`missing honesty marker: ${marker}`);
    }
  }

  if (!contentSource.includes(COMMISSION_COMPARISON_CALCULATOR_ROUTE)) {
    failures.push("content missing calculator route");
  }

  if (!pageSource.includes("CommissionComparisonCalculator")) {
    failures.push("page missing CommissionComparisonCalculator");
  }

  if (!pricingSource.includes("CommissionComparisonCalculator")) {
    failures.push("pricing page missing CommissionComparisonCalculator embed");
  }

  if (!upstreamSource.includes("DELIVERY_COMMISSION_BENCHMARK_RATE_PCT")) {
    failures.push("upstream policy missing benchmark rates");
  }

  if (!componentSource.includes("COMMISSION_COMPARISON_DASHBOARD_ROUTE")) {
    failures.push("calculator missing link to delivery-commissions dashboard");
  }

  return { ok: failures.length === 0, failures };
}
