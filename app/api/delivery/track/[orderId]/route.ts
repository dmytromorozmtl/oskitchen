import { NextResponse } from "next/server";
import { z } from "zod";

import { withApiGuard } from "@/lib/api/with-api-guard";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { recordDeliveryGpsPing } from "@/services/delivery/gps-tracking-service";

const bodySchema = z.object({
  lat: z.number(),
  lng: z.number(),
  driverLabel: z.string().max(120).optional(),
});

export const POST = withApiGuard(async (request) => {
  const { userId } = await requireTenantActor();
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  const orderId = segments[segments.length - 1];
  if (!orderId) {
    return NextResponse.json({ error: "Missing order id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await recordDeliveryGpsPing({
    userId,
    orderId,
    lat: parsed.data.lat,
    lng: parsed.data.lng,
    driverLabel: parsed.data.driverLabel,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
});
