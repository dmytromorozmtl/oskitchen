import { NextResponse } from "next/server";

import { buildVendorMarketplaceOpenApiSpec } from "@/lib/marketplace/vendor-api-types";
import { SITE_URL } from "@/lib/constants";
import {
  authenticateVendorApiRequest,
  handleVendorApiAction,
} from "@/services/marketplace/vendor-api-service";

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (url.searchParams.get("openapi") === "1") {
    return NextResponse.json(buildVendorMarketplaceOpenApiSpec(SITE_URL));
  }

  return NextResponse.json({
    name: "KitchenOS Marketplace Vendor API",
    openapi: "/api/vendor/webhooks?openapi=1",
    authentication: "Authorization: Bearer vk_…",
    events: ["new_order", "order_cancelled", "inventory_low", "payout_processed"],
  });
}

export async function POST(request: Request) {
  const vendor = await authenticateVendorApiRequest(request);
  if (!vendor) {
    return NextResponse.json({ error: "Unauthorized — invalid vendor API key." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const action = typeof body.action === "string" ? body.action : "";
  const result = await handleVendorApiAction({
    vendorId: vendor.vendorId,
    action,
    url: typeof body.url === "string" ? body.url : undefined,
    events: Array.isArray(body.events)
      ? body.events.filter((event): event is string => typeof event === "string")
      : undefined,
    webhookId: typeof body.webhookId === "string" ? body.webhookId : undefined,
    event: typeof body.event === "string" ? body.event : undefined,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status ?? 400 });
  }

  return NextResponse.json({ ok: true, vendorId: vendor.vendorId, ...result.result });
}
