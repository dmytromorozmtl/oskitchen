import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { importEmailOrderFromText } from "@/services/integrations/email-orders-intake-service";

export async function POST(request: Request) {
  const { dataUserId } = await requireTenantActor();
  const body = (await request.json().catch(() => ({}))) as { emailText?: string };
  if (!body.emailText?.trim()) {
    return NextResponse.json({ ok: false, message: "emailText required" }, { status: 400 });
  }
  const result = await importEmailOrderFromText(dataUserId, body.emailText);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
