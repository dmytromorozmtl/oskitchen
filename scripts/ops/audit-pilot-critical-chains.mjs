#!/usr/bin/env node
/**
 * Static chain audit: page → action → service files exist on disk.
 * Run: node scripts/ops/audit-pilot-critical-chains.mjs
 */
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

const CHAINS = [
  {
    name: "Orders list",
    page: "app/dashboard/orders/page.tsx",
    actions: ["actions/orders.ts"],
    services: ["services/order-hub/order-hub-service.ts", "services/orders/order-creation-service.ts"],
  },
  {
    name: "POS terminal",
    page: "app/dashboard/pos/terminal/page.tsx",
    actions: ["actions/pos.ts"],
    services: [
      "services/pos/pos-checkout-service.ts",
      "services/pos/pos-refund-service.ts",
      "services/pos/pos-shift-service.ts",
    ],
  },
  {
    name: "Production",
    page: "app/dashboard/production/page.tsx",
    actions: ["actions/production.ts"],
    services: ["services/production/generate-production.ts"],
  },
  {
    name: "Packing",
    page: "app/dashboard/packing/page.tsx",
    actions: ["actions/packing.ts"],
    services: ["services/packing/generate-packing-queue.ts"],
  },
  {
    name: "Storefront checkout",
    page: "app/s/[storeSlug]/checkout/page.tsx",
    actions: ["actions/storefront-order.ts"],
    services: [
      "services/storefront/storefront-stripe-checkout-service.ts",
      "services/storefront/storefront-cart-service.ts",
    ],
  },
  {
    name: "Stripe webhooks",
    page: "app/api/webhooks/stripe/route.ts",
    actions: [],
    services: ["services/storefront/storefront-stripe-checkout-service.ts"],
  },
  {
    name: "WooCommerce webhooks",
    page: "app/api/webhooks/woocommerce/route.ts",
    actions: [],
    services: ["services/webhooks/webhook-ingest-service.ts", "lib/webhooks/woocommerce-handler.ts"],
  },
  {
    name: "Webhook cron drain",
    page: "app/api/cron/webhook-jobs/route.ts",
    actions: [],
    services: ["services/webhooks/webhook-job-service.ts", "services/webhooks/webhook-job-runner.ts"],
  },
  {
    name: "Platform impersonation",
    page: "app/platform/layout.tsx",
    actions: ["actions/platform-impersonation.ts"],
    services: [],
    components: [
      "components/platform/platform-impersonation-bar.tsx",
      "components/dashboard/platform-impersonation-notice.tsx",
    ],
  },
  {
    name: "DSR export",
    page: "app/api/internal/dsr/export/route.ts",
    actions: [],
    services: ["services/dsr/user-data-export-service.ts"],
  },
];

let fail = 0;

function check(path) {
  const abs = join(ROOT, path);
  const ok = existsSync(abs);
  if (!ok) fail++;
  return ok ? "OK" : "MISSING";
}

console.log("=== Pilot critical chain audit ===\n");
console.log("| Surface | Page | Action/Route | Service | Status |");
console.log("|---------|------|--------------|---------|--------|");

for (const c of CHAINS) {
  const page = check(c.page);
  const actions =
    c.actions.length === 0
      ? "—"
      : c.actions.map((a) => `${check(a)} ${a}`).join("; ");
  const services =
    c.services.length === 0
      ? "—"
      : c.services.map((s) => `${check(s)} ${s}`).join("; ");
  const extra = (c.components ?? []).map((p) => `${check(p)} ${p}`).join("; ");
  const status =
    page === "OK" &&
    (c.actions.every((a) => check(a) === "OK") || c.actions.length === 0) &&
    (c.services.every((s) => check(s) === "OK") || c.services.length === 0) &&
    ((c.components ?? []).every((p) => check(p) === "OK") || !(c.components ?? []).length)
      ? "PASS"
      : "FAIL";
  console.log(`| ${c.name} | ${page} | ${actions || "—"} | ${services}${extra ? `; ${extra}` : ""} | ${status} |`);
}

console.log("");

/** Pilot-hot dashboard segments — must have route-level loading + error (or parent covers all). */
const PILOT_HOT_SEGMENTS = [
  "app/dashboard/orders",
  "app/dashboard/pos/terminal",
  "app/dashboard/production",
  "app/dashboard/packing",
  "app/dashboard/customers",
  "app/dashboard/billing",
  "app/dashboard/settings",
  "app/dashboard/storefront",
  "app/dashboard/reports",
];

function auditDashboardPages(dir, base = "app/dashboard") {
  const results = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith("_") || entry.name.startsWith("(")) continue;

    const pagePath = join(dir, entry.name);
    const rel = pagePath.replace(/\\/g, "/");
    const hasPage = existsSync(join(pagePath, "page.tsx"));
    if (hasPage) {
      const loading = existsSync(join(pagePath, "loading.tsx"));
      const error = existsSync(join(pagePath, "error.tsx"));
      const parentLoading = existsSync(join(dir, "loading.tsx"));
      const parentError = existsSync(join(dir, "error.tsx"));
      results.push({
        page: `/${rel.replace(/^app\//, "")}`,
        hasLoading: loading || parentLoading,
        hasError: error || parentError,
        status: (loading || parentLoading) && (error || parentError) ? "COMPLETE" : "MISSING_STATES",
      });
    }
    results.push(...auditDashboardPages(pagePath, base));
  }
  return results;
}

console.log("=== Dashboard route states (pilot-hot segments) ===\n");
let stateFail = 0;
for (const seg of PILOT_HOT_SEGMENTS) {
  const loading = existsSync(join(ROOT, seg, "loading.tsx"));
  const error = existsSync(join(ROOT, seg, "error.tsx"));
  const page = existsSync(join(ROOT, seg, "page.tsx"));
  const ok = page && loading && error;
  if (!ok) stateFail++;
  const icon = ok ? "PASS" : "WARN";
  console.log(
    `${icon} ${seg.replace(/^app\//, "/")} — page:${page ? "yes" : "no"} loading:${loading ? "yes" : "no"} error:${error ? "yes" : "no"}`,
  );
}

const dashResults = auditDashboardPages(join(ROOT, "app/dashboard"));
const complete = dashResults.filter((r) => r.status === "COMPLETE").length;
const missing = dashResults.filter((r) => r.status === "MISSING_STATES").length;
console.log(`\nAll dashboard pages with page.tsx: ${dashResults.length} (complete: ${complete}, missing states: ${missing})`);
if (missing > 0 && process.env.PILOT_AUDIT_STRICT_STATES === "1") {
  console.log("\nPages missing loading/error (no segment or parent boundary):");
  for (const r of dashResults.filter((x) => x.status === "MISSING_STATES").slice(0, 25)) {
    console.log(`  - ${r.page}`);
  }
  if (missing > 25) console.log(`  … and ${missing - 25} more`);
}

console.log("");
if (fail > 0 || stateFail > 0) {
  console.error(`CHAIN AUDIT: FAIL (${fail} missing paths, ${stateFail} pilot-hot segments without loading+error)`);
  process.exit(1);
}
console.log("CHAIN AUDIT: PASS");
