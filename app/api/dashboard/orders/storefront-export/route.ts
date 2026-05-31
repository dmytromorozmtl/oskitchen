import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { orderListWhereForOwner } from "@/lib/scope/workspace-order-scope";
import { storefrontOrdersToCsv } from "@/lib/storefront/orders-export-csv";
import { loadStorefrontSummariesForOrderIds } from "@/lib/storefront/order-hub-commerce";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_ROWS = 5_000;

/** Export OS Kitchen orders with storefront commerce columns (market, tax). */
export async function GET(request: Request) {
  const { dataUserId } = await requireTenantActor();
  const orderScope = await orderListWhereForOwner(dataUserId);
  const url = new URL(request.url);
  const source = url.searchParams.get("source")?.trim();
  const storefrontOnly = source === "storefront" || url.searchParams.get("storefrontOnly") === "1";

  const orders = await prisma.order.findMany({
    where: {
      AND: [orderScope, ...(storefrontOnly ? [{ creationSource: "STOREFRONT" }] : [])],
    },
    orderBy: { createdAt: "desc" },
    take: MAX_ROWS,
    select: {
      id: true,
      createdAt: true,
      customerName: true,
      customerEmail: true,
      status: true,
      fulfillmentType: true,
      creationSource: true,
      total: true,
    },
  });

  const summaries = await loadStorefrontSummariesForOrderIds(
    dataUserId,
    orders.map((o) => o.id),
  );

  const csv = storefrontOrdersToCsv(
    orders.map((o) => ({
      ...o,
      storefront: summaries.get(o.id) ?? null,
    })),
  );

  const stamp = new Date().toISOString().slice(0, 10);
  const suffix = storefrontOnly ? "storefront" : "all";
  const filename = `kitchenos-orders-${suffix}-${stamp}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
