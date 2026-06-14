/**
 * Wrap wave-1 dashboard pages with SuspenseWave1PageBoundary (P2-41).
 *
 * Usage: npx tsx scripts/wrap-suspense-wave1-p2-41.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type SuspenseWave1Sector = "today" | "marketplace" | "pos" | "kitchen";

const SUSPENSE_WAVE_1_PAGES: { pagePath: string; sector: SuspenseWave1Sector }[] = [
  { pagePath: "app/dashboard/today/profit/page.tsx", sector: "today" },
  { pagePath: "app/dashboard/marketplace/analytics/page.tsx", sector: "marketplace" },
  { pagePath: "app/dashboard/marketplace/auto-vendor/page.tsx", sector: "marketplace" },
  { pagePath: "app/dashboard/marketplace/catalog/page.tsx", sector: "marketplace" },
  { pagePath: "app/dashboard/marketplace/checkout/page.tsx", sector: "marketplace" },
  { pagePath: "app/dashboard/marketplace/commission-model/page.tsx", sector: "marketplace" },
  { pagePath: "app/dashboard/marketplace/compare/page.tsx", sector: "marketplace" },
  { pagePath: "app/dashboard/marketplace/comparison-tool/page.tsx", sector: "marketplace" },
  { pagePath: "app/dashboard/marketplace/empty-states/page.tsx", sector: "marketplace" },
  { pagePath: "app/dashboard/marketplace/financing/page.tsx", sector: "marketplace" },
  { pagePath: "app/dashboard/marketplace/orders/page.tsx", sector: "marketplace" },
  { pagePath: "app/dashboard/marketplace/price-intelligence/page.tsx", sector: "marketplace" },
  { pagePath: "app/dashboard/marketplace/products/[slug]/page.tsx", sector: "marketplace" },
  { pagePath: "app/dashboard/marketplace/quality/page.tsx", sector: "marketplace" },
  { pagePath: "app/dashboard/marketplace/restaurant-purchasing/page.tsx", sector: "marketplace" },
  { pagePath: "app/dashboard/marketplace/trust/page.tsx", sector: "marketplace" },
  { pagePath: "app/dashboard/marketplace/vendor-analytics/page.tsx", sector: "marketplace" },
  { pagePath: "app/dashboard/marketplace/vendor-onboarding/page.tsx", sector: "marketplace" },
  { pagePath: "app/dashboard/marketplace/vendor-payout-webhook/page.tsx", sector: "marketplace" },
  { pagePath: "app/dashboard/marketplace/vendors/[id]/page.tsx", sector: "marketplace" },
  { pagePath: "app/dashboard/marketplace/vendors/page.tsx", sector: "marketplace" },
  { pagePath: "app/dashboard/marketplace/wishlist/page.tsx", sector: "marketplace" },
  { pagePath: "app/dashboard/pos/cafe/page.tsx", sector: "pos" },
  { pagePath: "app/dashboard/pos/cash/page.tsx", sector: "pos" },
  { pagePath: "app/dashboard/pos/handheld/page.tsx", sector: "pos" },
  { pagePath: "app/dashboard/pos/mobile/page.tsx", sector: "pos" },
  { pagePath: "app/dashboard/pos/native-tablet/page.tsx", sector: "pos" },
  { pagePath: "app/dashboard/pos/receipts/page.tsx", sector: "pos" },
  { pagePath: "app/dashboard/pos/registers/page.tsx", sector: "pos" },
  { pagePath: "app/dashboard/pos/reports/page.tsx", sector: "pos" },
  { pagePath: "app/dashboard/pos/settings/hardware/page.tsx", sector: "pos" },
  { pagePath: "app/dashboard/pos/settings/offline/page.tsx", sector: "pos" },
  { pagePath: "app/dashboard/pos/settings/page.tsx", sector: "pos" },
  { pagePath: "app/dashboard/pos/shifts/page.tsx", sector: "pos" },
  { pagePath: "app/dashboard/pos/table-service/page.tsx", sector: "pos" },
  { pagePath: "app/dashboard/pos/tablet/page.tsx", sector: "pos" },
  { pagePath: "app/dashboard/pos/tabs/page.tsx", sector: "pos" },
  { pagePath: "app/dashboard/pos/terminal/customer-display/page.tsx", sector: "pos" },
  { pagePath: "app/dashboard/pos/transactions/page.tsx", sector: "pos" },
  { pagePath: "app/dashboard/kitchen/bump-recall-audit/page.tsx", sector: "kitchen" },
  { pagePath: "app/dashboard/kitchen/cameras/live/page.tsx", sector: "kitchen" },
  { pagePath: "app/dashboard/kitchen/cameras/page.tsx", sector: "kitchen" },
  { pagePath: "app/dashboard/kitchen/daisy-chain/page.tsx", sector: "kitchen" },
  { pagePath: "app/dashboard/kitchen/driver-eta/page.tsx", sector: "kitchen" },
  { pagePath: "app/dashboard/kitchen/expedite/page.tsx", sector: "kitchen" },
  { pagePath: "app/dashboard/kitchen/expo/page.tsx", sector: "kitchen" },
  { pagePath: "app/dashboard/kitchen/fullscreen/page.tsx", sector: "kitchen" },
  { pagePath: "app/dashboard/kitchen/manager/page.tsx", sector: "kitchen" },
  { pagePath: "app/dashboard/kitchen/multi-station/page.tsx", sector: "kitchen" },
  { pagePath: "app/dashboard/kitchen/packing-verification/page.tsx", sector: "kitchen" },
  { pagePath: "app/dashboard/kitchen/production/page.tsx", sector: "kitchen" },
  { pagePath: "app/dashboard/kitchen/routing-rules/page.tsx", sector: "kitchen" },
  { pagePath: "app/dashboard/kitchen/sla/page.tsx", sector: "kitchen" },
  { pagePath: "app/dashboard/kitchen/tablet/page.tsx", sector: "kitchen" },
  { pagePath: "app/dashboard/kitchen/voice/page.tsx", sector: "kitchen" },
];

function pageHasSuspenseWave1Boundary(source: string): boolean {
  return (
    source.includes("SuspenseWave1PageBoundary") ||
    source.includes("<Suspense") ||
    source.includes(" Suspense ")
  );
}

const ROOT = process.cwd();
const BOUNDARY_IMPORT =
  'import { SuspenseWave1PageBoundary } from "@/components/dashboard/suspense-wave1-page-boundary";';

function extractBalancedParens(source: string, openIndex: number): { inner: string; end: number } | null {
  let depth = 0;
  for (let i = openIndex; i < source.length; i += 1) {
    const ch = source[i];
    if (ch === "(") depth += 1;
    if (ch === ")") {
      depth -= 1;
      if (depth === 0) {
        return { inner: source.slice(openIndex + 1, i), end: i };
      }
    }
  }
  return null;
}

function wrapPage(pagePath: string, sector: SuspenseWave1Sector): { ok: boolean; reason: string } {
  const abs = join(ROOT, pagePath);
  const source = readFileSync(abs, "utf8");

  if (pageHasSuspenseWave1Boundary(source)) {
    return { ok: true, reason: "already wrapped" };
  }

  const marker = "export default async function ";
  const fnStart = source.indexOf(marker);
  if (fnStart === -1) {
    return { ok: false, reason: "no export default async function" };
  }

  const nameStart = fnStart + marker.length;
  const nameMatch = source.slice(nameStart).match(/^(\w+)/);
  if (!nameMatch) {
    return { ok: false, reason: "could not parse function name" };
  }
  const fnName = nameMatch[1];
  const parenOpen = nameStart + fnName.length;
  if (source[parenOpen] !== "(") {
    return { ok: false, reason: "could not find parameter list" };
  }

  const params = extractBalancedParens(source, parenOpen);
  if (!params) {
    return { ok: false, reason: "unbalanced parameter list" };
  }

  const asyncFnName = `${fnName}Async`;
  const trimmedParams = params.inner.trim();
  const hasParams = trimmedParams.length > 0;

  let propsTypeBlock = "";
  let wrapperParams = "()";
  let asyncParams = "()";
  let jsxSpread = "";

  if (hasParams) {
    const typeSplit = trimmedParams.match(/^([\s\S]+?):\s*([\s\S]+)$/);
    if (typeSplit) {
      const propsTypeName = `${fnName}Props`;
      propsTypeBlock = `type ${propsTypeName} = ${typeSplit[2].trim()};\n\n`;
      wrapperParams = `(props: ${propsTypeName})`;
      asyncParams = `(${typeSplit[1].trim()}: ${propsTypeName})`;
      jsxSpread = "{...props}";
    } else {
      wrapperParams = `(${trimmedParams})`;
      asyncParams = `(${trimmedParams})`;
      jsxSpread = "";
    }
  }

  const wrapper = `${propsTypeBlock}export default function ${fnName}${wrapperParams} {
  return (
    <SuspenseWave1PageBoundary sector="${sector}">
      <${asyncFnName} ${jsxSpread} />
    </SuspenseWave1PageBoundary>
  );
}

async function ${asyncFnName}${asyncParams}`;

  let updated =
    source.slice(0, fnStart) +
    wrapper +
    source.slice(parenOpen + params.inner.length + 2);

  if (!updated.includes(BOUNDARY_IMPORT)) {
    const lastImport = updated.lastIndexOf("\nimport ");
    if (lastImport === -1) {
      updated = `${BOUNDARY_IMPORT}\n\n${updated}`;
    } else {
      const lineEnd = updated.indexOf("\n", lastImport + 1);
      updated = `${updated.slice(0, lineEnd + 1)}${BOUNDARY_IMPORT}\n${updated.slice(lineEnd + 1)}`;
    }
  }

  writeFileSync(abs, updated, "utf8");
  return { ok: true, reason: "wrapped" };
}

function main() {
  let wrapped = 0;
  let skipped = 0;
  let failed = 0;

  for (const route of SUSPENSE_WAVE_1_PAGES) {
    const result = wrapPage(route.pagePath, route.sector);
    if (result.reason === "wrapped") wrapped += 1;
    else if (result.reason === "already wrapped") skipped += 1;
    else {
      failed += 1;
      console.error(`FAIL ${route.pagePath}: ${result.reason}`);
    }
  }

  console.log(`Suspense wave 1 (P2-41): wrapped=${wrapped} skipped=${skipped} failed=${failed}`);
  if (failed > 0) process.exit(1);
}

main();
