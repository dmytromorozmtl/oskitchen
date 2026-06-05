import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { connectKlaviyoWithApiKey } from "@/services/integrations/klaviyo/klaviyo-live-service";

export async function POST() {
  const { dataUserId } = await requireTenantActor();
  const result = await connectKlaviyoWithApiKey(dataUserId);
  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, message: "Klaviyo connected." });
}
