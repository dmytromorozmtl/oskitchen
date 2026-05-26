import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { findAdminStorefront } from "@/lib/storefront/load-admin-storefront";
import { captureErrorSafe } from "@/services/observability/error-reporting-service";

const qrSchema = z.object({
  storeSlug: z.string().min(1).max(100),
  tableId: z.string().min(1).max(50).optional(),
});

export async function POST(request: Request) {
  try {
    const { dataUserId } = await requireTenantActor();
    const body = await request.json();
    const parsed = qrSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const storefront = await findAdminStorefront(dataUserId, { storeSlug: true });
    if (!storefront || storefront.storeSlug !== parsed.data.storeSlug) {
      return NextResponse.json({ error: "Storefront not found" }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://os-kitchen.com";
    const { storeSlug, tableId } = parsed.data;
    const url = tableId
      ? `${baseUrl}/s/${storeSlug}/daily-menu?table=${encodeURIComponent(tableId)}`
      : `${baseUrl}/s/${storeSlug}/daily-menu`;

    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });

    return NextResponse.json({ qrDataUrl, url });
  } catch (err) {
    captureErrorSafe(err, { module: "storefront", action: "qr_generate" });
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}
