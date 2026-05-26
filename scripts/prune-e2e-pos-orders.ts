/**
 * Removes POS checkout rows created by Playwright against the seeded **E2E POS item** product.
 *
 * Matches: `orderType = POS_SALE`, workspace `E2E_SEED_USER_ID` / `SEED_USER_ID`, and at least one line
 * titled **E2E POS item** (snapshot title on `OrderItem`).
 *
 * Usage:
 *   E2E_SEED_USER_ID=<uuid> npx tsx scripts/prune-e2e-pos-orders.ts          # dry-run (list only)
 *   E2E_SEED_USER_ID=<uuid> npx tsx scripts/prune-e2e-pos-orders.ts --execute
 *
 * Deletes `POSTransaction` chain first (`Restrict` on order), then `order_items`, then `orders`.
 * If an order still has blocking FKs, it is skipped with a console warning.
 */
import { prisma } from "@/lib/prisma";

const PRODUCT_TITLE = "E2E POS item";

async function deletePosOrderChain(orderId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.posInventoryImpactEvent.deleteMany({ where: { orderId } });
    const posTxn = await tx.pOSTransaction.findUnique({ where: { orderId } });
    if (posTxn) {
      await tx.pOSPayment.deleteMany({ where: { transactionId: posTxn.id } });
      await tx.pOSReceipt.deleteMany({ where: { transactionId: posTxn.id } });
      await tx.pOSAuditEvent.deleteMany({ where: { transactionId: posTxn.id } });
      await tx.pOSTransaction.delete({ where: { id: posTxn.id } });
    }
    await tx.orderItem.deleteMany({ where: { orderId } });
    await tx.order.delete({ where: { id: orderId } });
  });
}

async function main() {
  const execute = process.argv.includes("--execute");
  const userId = process.env.E2E_SEED_USER_ID?.trim() || process.env.SEED_USER_ID?.trim();
  if (!userId) {
    console.error("Set E2E_SEED_USER_ID (or SEED_USER_ID).");
    process.exit(1);
  }

  const maxAgeHours = (() => {
    const raw = process.argv.find((a) => a.startsWith("--max-age-hours="));
    if (!raw) return undefined;
    const n = Number(raw.split("=")[1]);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  })();

  const since = maxAgeHours ? new Date(Date.now() - maxAgeHours * 3600_000) : undefined;

  const orders = await prisma.order.findMany({
    where: {
      userId,
      orderType: "POS_SALE",
      ...(since ? { createdAt: { gte: since } } : {}),
      orderItems: {
        some: {
          OR: [{ title: PRODUCT_TITLE }, { product: { title: PRODUCT_TITLE } }],
        },
      },
    },
    select: { id: true, createdAt: true, total: true },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  console.log(
    `${execute ? "EXECUTE" : "DRY-RUN"}: ${orders.length} POS_SALE order(s) with line "${PRODUCT_TITLE}" for user ${userId}` +
      (since ? ` (created after ${since.toISOString()})` : ""),
  );
  for (const o of orders) {
    console.log(`  - ${o.id}  total=${o.total}  created=${o.createdAt.toISOString()}`);
  }

  if (!execute || orders.length === 0) {
    if (!execute && orders.length > 0) {
      console.log("Re-run with --execute to delete these rows.");
    }
    return;
  }

  for (const o of orders) {
    try {
      await deletePosOrderChain(o.id);
      console.log("Deleted", o.id);
    } catch (e) {
      console.warn("Skip (FK or unexpected state):", o.id, e instanceof Error ? e.message : e);
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
