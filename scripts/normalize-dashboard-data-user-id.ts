/**
 * One-off normalizer: owner-scoped dashboard loaders must use dataUserId, not session user.id.
 * Storefront admin access (findAdminStorefront) intentionally uses session user — excluded.
 *
 *   npx tsx scripts/normalize-dashboard-data-user-id.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { readdirSync, statSync } from "node:fs";

const ROOT = process.cwd();

const TARGET_DIRS = [
  "app/dashboard/product-mapping",
  "app/dashboard/go-live",
  "app/dashboard/costing",
  "app/dashboard/meal-plans",
  "app/dashboard/import-export",
  "app/dashboard/integration-health",
  "app/dashboard/packing",
  "app/dashboard/sales-channels",
  "app/dashboard/order-hub",
  "app/dashboard/error-recovery",
  "app/dashboard/menu-planner",
  "app/dashboard/copilot",
  "app/dashboard/catering-quotes",
  "app/dashboard/pos",
  "app/dashboard/demo",
  "app/dashboard/import-center",
  "app/dashboard/inventory",
  "app/dashboard/purchasing",
  "app/dashboard/system-health",
  "app/dashboard/training",
  "app/dashboard/forecast",
  "app/dashboard/analytics",
  "app/dashboard/locations",
  "app/dashboard/brands",
  "app/dashboard/implementation",
  "app/dashboard/reports",
  "app/dashboard/staff",
  "app/dashboard/billing",
  "app/dashboard/support",
];

const STOREFRONT_MEDIA_ONLY = "app/dashboard/storefront";

const SKIP_CALL =
  /findAdminStorefront|resolveStorefrontAdminAccess|resolveOwnerStorefront|listOwnerStorefronts|getBillingAccess|userProfile\.findUnique|ensureAppUser|canAccessGrowthModule/;

function walk(dir: string, out: string[] = []): string[] {
  const abs = join(ROOT, dir);
  if (!statSync(abs, { throwIfNoEntry: false })) return out;
  for (const ent of readdirSync(abs, { withFileTypes: true })) {
    if (ent.name.startsWith(".")) continue;
    const rel = join(dir, ent.name);
    if (ent.isDirectory()) walk(rel, out);
    else if (ent.name.endsWith(".tsx") || ent.name.endsWith(".ts")) out.push(rel);
  }
  return out;
}

function normalizeFile(rel: string, mediaOnly: boolean): boolean {
  let content = readFileSync(join(ROOT, rel), "utf8");
  if (!content.includes("dataUserId") || !content.includes("sessionUser: user")) return false;

  const original = content;

  if (mediaOnly) {
    content = content.replace(/listStorefrontMediaForOwner\(user\.id/g, "listStorefrontMediaForOwner(dataUserId");
    if (content !== original) {
      writeFileSync(join(ROOT, rel), content);
      return true;
    }
    return false;
  }

  // Replace user.id with dataUserId in owner-loader calls (line-safe heuristic).
  content = content.replace(/\buser\.id\b/g, (match, offset) => {
    if (/\br\.user\.id\b/.test(content.slice(Math.max(0, offset - 3), offset + 10))) return match;
    const lineStart = content.lastIndexOf("\n", offset) + 1;
    const lineEnd = content.indexOf("\n", offset);
    const line = content.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
    if (SKIP_CALL.test(line)) return match;
    return "dataUserId";
  });

  if (content !== original) {
    writeFileSync(join(ROOT, rel), content);
    return true;
  }
  return false;
}

function main() {
  const changed: string[] = [];
  for (const dir of TARGET_DIRS) {
    for (const rel of walk(dir)) {
      if (normalizeFile(rel, false)) changed.push(rel);
    }
  }
  for (const rel of walk(STOREFRONT_MEDIA_ONLY)) {
    if (normalizeFile(rel, true)) changed.push(rel);
  }

  if (changed.length === 0) {
    console.log("No files needed normalization.");
    return;
  }
  console.log(`Normalized ${changed.length} file(s):`);
  for (const f of changed) console.log(`  ${f}`);
}

main();
