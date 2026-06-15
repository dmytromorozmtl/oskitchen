/**
 * CI guard: pilot-critical paths must not use raw `userId: dataUserId` on workspace-scoped models.
 *
 *   npx tsx scripts/validate-tenant-scope-pilot.ts
 *
 * Allowlist: config/tenant-scope-pilot-allowlist.json (relative paths, gradual burn-down).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

const SCOPE_MARKERS = [
  "orderListWhereForOwner",
  "orderByIdWhereForOwner",
  "orderListWhereForOwnerAnd",
  "getCachedOrderListWhere",
  "whereOrdersInWindowForOwner",
  "whereOrdersForOwnerAnd",
  "buildOwnerScopedWhere",
  "prismaOwnerScopeWhere",
  "whereOwnedOrderForOwner",
  "orderHubWhere",
  "menuListWhereForOwner",
  "menuByIdWhereForOwner",
  "productListWhereForOwner",
  "productListWhereForOwnerAnd",
  "productByIdWhereForOwner",
  "integrationConnectionListWhereForOwner",
  "integrationConnectionByIdWhereForOwner",
  "integrationConnectionByProviderWhereForOwner",
  "getCachedIntegrationConnectionListWhere",
  "webhookEventListWhereForOwner",
  "getCachedWebhookEventListWhere",
  "channelImportBatchListWhereForOwner",
  "channelImportBatchByIdWhereForOwner",
  "channelImportBatchRelationWhere",
  "kitchenCustomerListWhereForOwner",
  "kitchenCustomerByIdWhereForOwner",
  "kitchenCustomerScopeWhere",
  "externalOrderListWhereForOwner",
  "externalOrderByIdWhereForOwner",
  "channelConflictWhereForOwner",
  "channelSyncJobListWhereForOwner",
  "externalProductListWhereForOwner",
  "externalProductByIdWhereForOwner",
  "productMappingListWhereForOwner",
  "productMappingByIdWhereForOwner",
  "productMappingAliasListWhereForOwner",
  "errorRecoveryItemListWhereForOwner",
  "errorRecoveryItemByIdWhereForOwner",
  "importJobListWhereForOwner",
  "importJobByIdWhereForOwner",
  "exportJobListWhereForOwner",
  "cateringQuoteListWhereForOwner",
  "cateringQuoteByIdWhereForOwner",
  "apiKeyListWhereForOwner",
  "automationRuleListWhereForOwner",
  "analyticsEventListWhereForOwner",
  "printedLabelListWhereForOwner",
  "printedLabelListWhereForOwnerAnd",
  "printedLabelByIdWhereForOwner",
];

const SCOPED_MODELS = [
  "order",
  "menu",
  "product",
  "integrationConnection",
  "webhookEvent",
  "channelImportBatch",
  "kitchenCustomer",
  "externalOrder",
  "channelConflict",
  "channelSyncJob",
  "externalProduct",
  "productMapping",
  "errorRecoveryItem",
  "importJob",
  "exportJob",
  "cateringQuote",
  "apiKey",
  "automationRule",
] as const;

const SCAN_ROOTS = [
  "actions/orders.ts",
  "actions/channel-command-center.ts",
  "actions/implementation.ts",
  "actions/packing-verify.ts",
  "actions/delivery-route.ts",
  "actions/menus.ts",
  "actions/products.ts",
  "services/order-hub",
  "services/orders",
  "services/packing",
  "services/crm",
  "services/import-center",
  "services/product-mapping",
  "services/go-live",
  "services/observability",
  "services/webhooks",
  "services/today",
  "services/orders",
  "services/integrity",
  "app/dashboard/error-recovery",
  "app/dashboard/orders",
  "app/dashboard/packing",
  "app/dashboard/order-hub",
  "app/dashboard/sales-channels",
  "app/dashboard/product-mapping",
  "app/dashboard/implementation",
  "actions/production.ts",
  "actions/allergen-profile.ts",
  "actions/ingredient-declaration.ts",
  "actions/label-print-queue.ts",
  "actions/nutrition-profile.ts",
  "actions/storefront-product-public.ts",
  "services/production",
  "services/kitchen-screen",
  "services/pos",
  "app/dashboard/products",
  "app/dashboard/production",
  "app/dashboard/go-live",
  "app/dashboard/menu-planner",
  "app/dashboard/nutrition-labels",
  "actions/label-print-queue.ts",
  "app/dashboard/costing",
  "app/dashboard/brands",
  "app/dashboard/meal-plans",
  "services/costing",
  "services/ingredient-demand",
  "services/import-export",
  "services/search",
  "services/nutrition-labels",
  "services/demo",
  "lib/activation.ts",
  "lib/import-export/streaming-csv-export.ts",
  "components/dashboard/home-overview.tsx",
  "app/api/public/v1/products",
  "app/dashboard/forecast",
  "app/dashboard/executive",
  "app/dashboard/locations",
  "app/dashboard/catering-quotes",
  "app/dashboard/analytics",
  "app/dashboard/customers",
  "app/dashboard/menus",
  "app/dashboard/storefront",
  "app/dashboard/import-center",
  "app/dashboard/implementation",
];

const RAW_PATTERN = new RegExp(
  `prisma\\.(${SCOPED_MODELS.join("|")})\\.(findFirst|findMany|findUnique|count|update|updateMany|delete|deleteMany|groupBy|aggregate)`,
);

const RAW_USER_IN_WHERE = /\buserId:\s*(dataUserId|scope\.userId|ownerUserId|input\.userId)/;

const SCOPE_WINDOW_MARKERS =
  /orderScope|orderWhere|orderListWhere|getCachedOrder|whereOrders|orderHubWhere|menuByIdWhere|menuListWhere|menuWhere|productByIdWhere|productListWhere|productWhere|connectionWhere|batchWhere|webhookWhere|integrationWhere|externalOrderWhere|externalProductWhere|unmappedWhere|mappingWhere|mappingScope|recoveryWhere|syncJobWhere|customerScope|customerWhere|kitchenCustomer|importJobWhere|exportJobWhere|printedLabelWhere|printedLabelListWhere|printedLabelById|ListWhereForOwner|ByIdWhereForOwner|await menu|await product|await order|await integration|await channel|await webhook/;

const NON_SCOPED_PRISMA_LINE =
  /prisma\.(kitchenSettings|importJob|staffMember|channelSyncJob|storefrontDomain|notificationRule|implementationTask|productMappingEvent|productMappingImportBatch)/;

function walk(dir: string, out: string[] = []): string[] {
  const abs = join(ROOT, dir);
  if (!statSync(abs, { throwIfNoEntry: false })) return out;
  if (statSync(abs).isFile()) {
    out.push(dir);
    return out;
  }
  for (const ent of readdirSync(abs, { withFileTypes: true })) {
    if (ent.name.startsWith(".")) continue;
    const p = join(abs, ent.name);
    if (ent.isDirectory()) walk(join(dir, ent.name), out);
    else if (ent.name.endsWith(".ts") || ent.name.endsWith(".tsx")) out.push(join(dir, ent.name));
  }
  return out;
}

function loadAllowlist(): Set<string> {
  const path = join(ROOT, "config/tenant-scope-pilot-allowlist.json");
  if (!statSync(path, { throwIfNoEntry: false })) return new Set();
  const json = JSON.parse(readFileSync(path, "utf8")) as { paths?: string[] };
  return new Set(json.paths ?? []);
}

function fileHasScopeMarkers(content: string): boolean {
  return SCOPE_MARKERS.some((m) => content.includes(m));
}

function findViolations(relPath: string, content: string): string[] {
  const issues: string[] = [];
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (NON_SCOPED_PRISMA_LINE.test(line)) continue;
    if (!RAW_PATTERN.test(line)) continue;
    const window = lines.slice(i, Math.min(i + 12, lines.length)).join("\n");
    const prior = lines.slice(Math.max(0, i - 30), i + 1).join("\n");
    if (SCOPE_WINDOW_MARKERS.test(window)) continue;
    if (
      /prisma\.productMapping\.update\(/.test(line) &&
      /where:\s*\{\s*id:/.test(window) &&
      /productMappingByIdWhereForOwner|mappingScopeAnd/.test(prior)
    ) {
      continue;
    }
    if (RAW_USER_IN_WHERE.test(window)) {
      issues.push(`${relPath}:${i + 1}: raw userId filter on scoped model`);
    }
  }
  return issues;
}

function main() {
  const allowlist = loadAllowlist();
  const files = SCAN_ROOTS.flatMap((r) => walk(r));
  const violations: string[] = [];

  for (const rel of files) {
    if (allowlist.has(rel)) continue;
    const content = readFileSync(join(ROOT, rel), "utf8");
    if (fileHasScopeMarkers(content) && !content.match(RAW_PATTERN)) continue;
    violations.push(...findViolations(rel, content));
  }

  if (violations.length === 0) {
    console.log(`✓ Tenant scope pilot guard: ${files.length} files scanned, no raw userId on scoped models.`);
    return;
  }

  console.error(`Tenant scope pilot guard: ${violations.length} violation(s)\n`);
  for (const v of violations.slice(0, 40)) console.error(`  ${v}`);
  if (violations.length > 40) console.error(`  … and ${violations.length - 40} more`);
  console.error("\nUse workspace-resource-scope helpers or add path to config/tenant-scope-pilot-allowlist.json");
  process.exitCode = 1;
}

main();
