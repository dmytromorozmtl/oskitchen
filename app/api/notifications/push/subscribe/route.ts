import { NextResponse } from "next/server";
import { z } from "zod";

import { getTenantActor } from "@/lib/scope/cached-tenant";
import { savePushSubscription } from "@/services/notifications/push-service";

const bodySchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid subscription" }, { status: 400 });
  }

  try {
    const { dataUserId } = await getTenantActor();
    await savePushSubscription(dataUserId, parsed.data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
}
