import { NextResponse } from "next/server";

import { decryptOrderPiiFields } from "@/lib/orders/order-pii";
import { guardPublicApiV1Resource, isGuardError } from "@/lib/api-public/guard";
import { publicApiOrderCreateSchema } from "@/lib/orders/public-api-order-create";
import { prisma } from "@/lib/prisma";
import { createOrderViaCenter } from "@/services/orders/order-creation-service";

/** Enterprise API — authenticate with `Authorization: Bearer kos_...`. */

export async function GET(request: Request) {
  const guard = await guardPublicApiV1Resource(
    request,
    "orders",
    "GET",
    "public_api_orders_get",
  );
  if (isGuardError(guard)) return guard.response;
  const userId = guard.userId;

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      customerName: true,
      customerEmail: true,
      status: true,
      total: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    data: orders.map((o) => {
      const pii = decryptOrderPiiFields({
        customerName: o.customerName,
        customerEmail: o.customerEmail,
      });
      return {
        ...o,
        customerName: pii.customerName,
        customerEmail: pii.customerEmail,
        total: o.total.toString(),
      };
    }),
  });
}

export async function POST(request: Request) {
  const guard = await guardPublicApiV1Resource(
    request,
    "orders",
    "POST",
    "public_api_orders_post",
  );
  if (isGuardError(guard)) return guard.response;
  const userId = guard.userId;

  const json = await request.json().catch(() => null);
  const parsed = publicApiOrderCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const created = await createOrderViaCenter(
    { userId },
    {
      orderType: "CUSTOM_ORDER",
      persistedOrderType: "MANUAL",
      creationSourceOverride: "PUBLIC_API",
      statusKey: "REQUESTED",
      fulfillmentDetail: parsed.data.fulfillmentType ?? "PICKUP",
      customerName: parsed.data.customerName,
      customerEmail: parsed.data.customerEmail,
      customerPhone: parsed.data.customerPhone ?? undefined,
      brandId: parsed.data.brandId,
      locationId: parsed.data.locationId,
      notes: parsed.data.notes ?? undefined,
      total: parsed.data.total,
      subtotal: parsed.data.total,
      lines: [
        {
          title: "Public API order",
          quantity: 1,
          unitPrice: parsed.data.total,
        },
      ],
    },
  );
  if (!created.ok) {
    return NextResponse.json({ error: created.error }, { status: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { id: created.orderId, userId },
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true,
    },
  });
  if (!order) {
    return NextResponse.json(
      { error: "Order missing after creation." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    data: {
      ...order,
      customerName: created.customerName,
      customerEmail: created.customerEmail,
      total: order.total.toString(),
    },
  });
}
