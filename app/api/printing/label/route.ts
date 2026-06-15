import { NextResponse } from "next/server";
import { z } from "zod";

import { withApiGuard } from "@/lib/api/with-api-guard";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { sendLabelToPrinter } from "@/services/printing/zebra-printer-service";

const bodySchema = z.object({
  vendor: z.enum(["zebra", "dymo", "epson"]),
  title: z.string().min(1).max(255),
  sku: z.string().max(120).optional(),
  barcode: z.string().max(120).optional(),
  quantity: z.number().int().positive().max(99).optional(),
});

export const POST = withApiGuard(async (request) => {
  await requireTenantActor();
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await sendLabelToPrinter(parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
});
