import { NextResponse } from "next/server";
import { z } from "zod";

import { processQROrder } from "@/services/qr/qr-ordering-service";
import { captureErrorSafe } from "@/services/observability/error-reporting-service";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(100),
  tableRouteId: z.string().min(1).max(80),
  lines: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.coerce.number().int().positive().max(99),
      }),
    )
    .min(1)
    .max(50),
  customerName: z.string().trim().max(120).optional(),
  checkoutStyle: z.enum(["pay_later", "pay_now", "split"]).optional(),
  splitGuests: z.coerce.number().int().min(2).max(20).optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid order payload." }, { status: 400 });
    }

    const result = await processQROrder({
      storeSlug: parsed.data.storeSlug,
      tableRouteId: parsed.data.tableRouteId,
      lines: parsed.data.lines,
      customerName: parsed.data.customerName,
      checkoutStyle: parsed.data.checkoutStyle,
      splitGuests: parsed.data.splitGuests,
    });

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      orderId: result.orderId,
      lookupToken: result.lookupToken,
      estimatedWaitMinutes: result.estimatedWaitMinutes,
      tableLabel: result.tableLabel,
      paymentStatus: result.paymentStatus,
      checkoutStyle: result.checkoutStyle,
      orderTotal: result.orderTotal,
      splitShareAmount: result.splitShareAmount,
      splitGuests: result.splitGuests,
    });
  } catch (err) {
    captureErrorSafe(err, { module: "qr-ordering", action: "public_place_order" });
    return NextResponse.json({ ok: false, error: "Could not place order." }, { status: 500 });
  }
}
