/**
 * Optional backfill: wrap legacy cartJson arrays in schema v2 envelope;
 * infer marketId from StorefrontOrder.source when missing.
 *
 * Usage:
 *   npm run storefront:backfill-cart-v2
 *   npm run storefront:backfill-cart-v2 -- --dry-run
 */
import { PrismaClient } from "@prisma/client";

import {
  buildCartSnapshotEnvelope,
  parseStorefrontCartSnapshot,
} from "@/lib/storefront/cart-snapshot";
import { parseMarketIdFromOrderSource } from "@/lib/storefront/order-commerce-context";
import { loadStorefrontScriptEnv } from "./lib/load-storefront-script-env";

loadStorefrontScriptEnv();

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");
const BATCH = 100;

async function main() {
  let lastId: string | undefined;
  let updated = 0;
  let skipped = 0;

  for (;;) {
    const rows = await prisma.storefrontOrder.findMany({
      where: {
        cartJson: { not: null },
        ...(lastId ? { id: { gt: lastId } } : {}),
      },
      orderBy: { id: "asc" },
      take: BATCH,
      select: { id: true, cartJson: true, source: true },
    });
    if (rows.length === 0) break;

    for (const row of rows) {
      lastId = row.id;
      const { envelope, lines, marketId: fromCart } = parseStorefrontCartSnapshot(row.cartJson);
      if (envelope?.schemaVersion === 2) {
        skipped++;
        continue;
      }
      if (lines.length === 0) {
        skipped++;
        continue;
      }

      const marketId = fromCart ?? parseMarketIdFromOrderSource(row.source);
      const next = buildCartSnapshotEnvelope({
        marketId,
        lines,
        taxBreakdown: envelope?.taxBreakdown,
        taxMode: envelope?.taxMode,
        taxRegionCode: envelope?.taxRegionCode ?? null,
      });

      if (!dryRun) {
        await prisma.storefrontOrder.update({
          where: { id: row.id },
          data: { cartJson: next },
        });
      }
      updated++;
    }

    if (rows.length < BATCH) break;
  }

  console.log(dryRun ? "[dry-run] " : "", `Updated ${updated}, skipped ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
