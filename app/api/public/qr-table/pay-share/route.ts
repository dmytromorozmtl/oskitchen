import { NextResponse } from "next/server";
import { z } from "zod";

import { payQrTableSplitShare } from "@/services/qr/qr-ordering-service";
import { captureErrorSafe } from "@/services/observability/error-reporting-service";

const bodySchema = z.object({
  storeSlug: z.string().min(1).max(100),
  orderId: z.string().uuid(),
  lookupToken: z.string().min(4).max(64),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: "Invalid payment payload." }, { status: 400 });
    }

    const result = await payQrTableSplitShare(parsed.data);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    captureErrorSafe(err, { module: "qr-table", action: "pay_share" });
    return NextResponse.json({ ok: false, error: "Could not record payment." }, { status: 500 });
  }
}
