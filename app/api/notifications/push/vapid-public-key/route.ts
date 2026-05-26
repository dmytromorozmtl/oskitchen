import { NextResponse } from "next/server";

import { getVapidPublicKey } from "@/services/notifications/push-service";

export async function GET() {
  const key = getVapidPublicKey();
  if (!key) {
    return NextResponse.json({ ok: false, error: "VAPID not configured" }, { status: 503 });
  }
  return NextResponse.json({ ok: true, publicKey: key });
}
