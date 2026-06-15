import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { submitEdi850PurchaseOrder } from "@/services/purchasing/edi-service";

const bodySchema = z.object({
  purchaseOrderId: z.string().uuid(),
  distributor: z.enum(["SYSCO", "US_FOODS"]),
});

export async function POST(request: NextRequest) {
  try {
    const { dataUserId } = await requireTenantActor();
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const po = await prisma.purchaseOrder.findFirst({
      where: { id: parsed.data.purchaseOrderId, userId: dataUserId },
      include: { lines: { take: 50 } },
    });
    if (!po) {
      return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
    }

    const result = await submitEdi850PurchaseOrder(dataUserId, parsed.data.distributor, {
      orderNumber: po.orderNumber,
      lines: po.lines.map((l) => ({
        sku: l.description,
        quantity: Number(l.quantity),
        unit: l.unit,
      })),
    });

    return NextResponse.json({
      status: result.ok ? "CONFIRMED" : "PENDING",
      message: result.message,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
