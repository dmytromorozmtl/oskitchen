import { NextResponse } from "next/server";

import { assertPlatformPermission, requirePlatformAccess } from "@/lib/platform/platform-guards";
import { loadPartnerBillingOverview } from "@/services/platform/partner-billing-service";

export async function GET() {
  try {
    const ctx = await requirePlatformAccess();
    assertPlatformPermission(ctx, "platform:billing:read");
    const overview = await loadPartnerBillingOverview();
    return NextResponse.json({ ok: true, overview });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 403 });
  }
}
