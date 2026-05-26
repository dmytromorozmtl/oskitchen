/**
 * Storefront-only environment validation with optional markdown report.
 *
 *   npm run check-env:storefront
 *   npm run check-env:storefront:report
 *
 * Loads (in order, without overwriting existing process.env):
 *   .env.production.local → .env.local → .env
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import {
  evaluateStorefrontReleaseEnv,
  storefrontReleaseEnvSummary,
} from "@/lib/storefront/storefront-release-env";
import { formatEnvReportMarkdown } from "@/lib/storefront/storefront-release-reports";
import { loadProductionEnvLocal } from "./lib/load-dotenv-file";

const ROOT = process.cwd();

function main(): void {
  const loaded = loadProductionEnvLocal(ROOT);
  const target = process.env.STOREFRONT_ENV_TARGET?.trim() || "production";

  const checks = evaluateStorefrontReleaseEnv({
    requireStripe: process.env.STOREFRONT_CHECK_STRIPE === "1",
    requireEmail: process.env.STOREFRONT_CHECK_EMAIL === "1",
    week1Mode: process.env.STOREFRONT_WEEK1_MODE === "1",
  });
  const summary = storefrontReleaseEnvSummary(checks);

  console.log("KitchenOS — storefront env check (secrets not logged)\n");
  if (loaded.length) {
    console.log(`Loaded: ${loaded.join(", ")}\n`);
  } else {
    console.log("No .env files loaded — using process.env only\n");
  }

  for (const c of checks) {
    const icon = c.passed ? "✓" : c.level === "critical" ? "✗" : "⚠";
    console.log(`${icon} [${c.level}] ${c.label} — ${c.detail}`);
  }

  console.log(
    summary.allCriticalPassed
      ? "\n✓ All critical storefront env checks passed"
      : `\n✗ ${summary.criticalFailed} critical check(s) failed`,
  );

  const reportPath =
    process.env.STOREFRONT_ENV_REPORT?.trim() ||
    (process.argv.includes("--report")
      ? join(ROOT, "docs", "artifacts", "storefront-env-report-latest.md")
      : "");

  if (reportPath) {
    const md = formatEnvReportMarkdown({
      checks,
      loadedFiles: loaded,
      target: target as "production" | "staging" | "local",
    });
    mkdirSync(dirname(reportPath), { recursive: true });
    writeFileSync(reportPath, md, "utf8");
    console.log(`\nReport: ${reportPath}`);
  }

  if (!summary.allCriticalPassed) {
    process.exitCode = 1;
  }
}

main();
