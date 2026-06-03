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
  listMissingWooCommerceLiveSmokeEnvVars,
  readWooCommerceLiveSmokeEnv,
} from "./smoke-woocommerce-live";

function printBlock(title: string, missing: string[]) {
  console.log(`\n## ${title}`);
  if (missing.length === 0) {
    console.log("All prerequisite env vars present — run the live smoke next.");
    return;
  }
  console.log("Missing:");
  for (const key of missing) {
    console.log(`  - ${key}`);
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

console.log("OS Kitchen — live smoke checklist (Domination steps 4–5)\n");
console.log(`.env.smoke.local: ${smokeLocal ? "found" : "not found (copy .env.smoke.example)"}`);
if (loaded.length > 0) {
  console.log(`Loaded: ${loaded.join(", ")}`);
}

const wooMissing = listMissingWooCommerceLiveSmokeEnvVars(readWooCommerceLiveSmokeEnv());
const shopifyMissing = listMissingShopifyLiveSmokeEnvVars(readShopifyLiveSmokeEnv());

printBlock("WooCommerce (step 4)", wooMissing);
printBlock("Shopify (step 5)", shopifyMissing);

console.log("\n## Current artifacts");
console.log(`  woocommerce-live-smoke-summary.json → ${artifactOverall("artifacts/woocommerce-live-smoke-summary.json")}`);
console.log(`  shopify-live-smoke-summary.json → ${artifactOverall("artifacts/shopify-live-smoke-summary.json")}`);

console.log("\n## Next commands");
console.log("  npm run smoke:woo-live          # after Woo vars set");
console.log("  npm run smoke:shopify-live      # after Shopify vars set");
console.log("  npm run smoke:channels-live     # both + domination-next-step");
console.log("  ./scripts/domination-next-step.sh");
console.log("\nGuides: docs/domination-live-smoke-ops.md");

process.exit(0);
