/**
 * Print missing env vars for Market Domination live smokes (steps 4–5).
 * Usage: npx tsx scripts/print-live-smoke-checklist.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { loadSmokeEnv } from "./lib/load-smoke-env";
import {
  listMissingShopifyLiveSmokeEnvVars,
  readShopifyLiveSmokeEnv,
} from "./smoke-shopify-live";
import {
import { logger } from "@/lib/logger";
  listMissingWooCommerceLiveSmokeEnvVars,
  readWooCommerceLiveSmokeEnv,
} from "./smoke-woocommerce-live";

function printBlock(title: string, missing: string[]) {
  logger.cli(`\n## ${title}`);
  if (missing.length === 0) {
    logger.cli("All prerequisite env vars present — run the live smoke next.");
    return;
  }
  logger.cli("Missing:");
  for (const key of missing) {
    logger.cli(`  - ${key}`);
  }
}

function artifactOverall(path: string): string {
  try {
    const raw = readFileSync(join(process.cwd(), path), "utf8");
    const d = JSON.parse(raw) as { overall?: string };
    return d.overall ?? "unknown";
  } catch {
    return "missing";
  }
}

const loaded = loadSmokeEnv();
const smokeLocal = existsSync(join(process.cwd(), ".env.smoke.local"));

logger.cli("OS Kitchen — live smoke checklist (Domination steps 4–5)\n");
logger.cli(`.env.smoke.local: ${smokeLocal ? "found" : "not found (copy .env.smoke.example)"}`);
if (loaded.length > 0) {
  logger.cli(`Loaded: ${loaded.join(", ")}`);
}

const wooMissing = listMissingWooCommerceLiveSmokeEnvVars(readWooCommerceLiveSmokeEnv());
const shopifyMissing = listMissingShopifyLiveSmokeEnvVars(readShopifyLiveSmokeEnv());

printBlock("WooCommerce (step 4)", wooMissing);
printBlock("Shopify (step 5)", shopifyMissing);

logger.cli("\n## Current artifacts");
logger.cli(`  woocommerce-live-smoke-summary.json → ${artifactOverall("artifacts/woocommerce-live-smoke-summary.json")}`);
logger.cli(`  shopify-live-smoke-summary.json → ${artifactOverall("artifacts/shopify-live-smoke-summary.json")}`);

logger.cli("\n## Next commands");
logger.cli("  npm run smoke:woo-live          # after Woo vars set");
logger.cli("  npm run smoke:shopify-live      # after Shopify vars set");
logger.cli("  npm run smoke:channels-live     # both + domination-next-step");
logger.cli("  ./scripts/domination-next-step.sh");
logger.cli("\nGuides: docs/domination-live-smoke-ops.md");

process.exit(0);
