import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  COMMISSION_COMPARISON_LANDING_META,
  COMMISSION_COMPARISON_LANDING_PATH,
  COMMISSION_COMPARISON_LANDING_REQUIRED_SECTIONS,
} from "@/lib/marketing/commission-comparison-landing-content";

export type CommissionComparisonLandingAudit = {
  ok: boolean;
  failures: string[];
};

export function auditCommissionComparisonLandingWiring(
  root = process.cwd(),
): CommissionComparisonLandingAudit {
  const failures: string[] = [];
  const paths = [
    "app/commission-comparison/page.tsx",
    "components/marketing/commission-comparison-landing.tsx",
    "lib/marketing/commission-comparison-landing-content.ts",
    "components/marketing/commission-comparison-calculator.tsx",
    "components/marketing/commission-comparison-doordash-panel.tsx",
  ];

  for (const rel of paths) {
    if (!existsSync(join(root, rel))) {
      failures.push(`missing wiring path: ${rel}`);
    }
  }

  const landingSource = readFileSync(
    join(root, "components/marketing/commission-comparison-landing.tsx"),
    "utf8",
  );
  const calculatorSource = readFileSync(
    join(root, "components/marketing/commission-comparison-calculator.tsx"),
    "utf8",
  );
  const doordashSource = readFileSync(
    join(root, "components/marketing/commission-comparison-doordash-panel.tsx"),
    "utf8",
  );
  const combinedSource = `${landingSource}\n${calculatorSource}\n${doordashSource}`;
  const contentSource = readFileSync(
    join(root, "lib/marketing/commission-comparison-landing-content.ts"),
    "utf8",
  );
  const pageSource = readFileSync(join(root, "app/commission-comparison/page.tsx"), "utf8");

  for (const section of COMMISSION_COMPARISON_LANDING_REQUIRED_SECTIONS) {
    if (!combinedSource.includes(section)) {
      failures.push(`landing wiring missing section marker: ${section}`);
    }
  }

  if (!landingSource.includes("CommissionComparisonCalculator")) {
    failures.push("landing must render CommissionComparisonCalculator");
  }

  if (!landingSource.includes("CommissionComparisonDoorDashPanel")) {
    failures.push("landing must render CommissionComparisonDoorDashPanel");
  }

  if (!contentSource.includes(COMMISSION_COMPARISON_LANDING_PATH)) {
    failures.push("content missing landing path constant");
  }

  if (!contentSource.includes("commission comparison calculator")) {
    failures.push("content missing primary SEO keyword");
  }

  if (!pageSource.includes("CommissionComparisonLanding")) {
    failures.push("page missing CommissionComparisonLanding component");
  }

  if (!contentSource.includes(COMMISSION_COMPARISON_LANDING_META.utmCampaign)) {
    failures.push("content missing utm campaign");
  }

  return { ok: failures.length === 0, failures };
}
