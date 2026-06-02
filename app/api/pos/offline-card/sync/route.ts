import { NextResponse } from "next/server";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { syncOfflineCardCaptures } from "@/services/pos/offline-card-service";

export async function POST() {
  const access = await requireMutationPermission("pos.checkout");
  if (!access.ok) {
    return Response.json({ error: access.error }, { status: 403 });
  }

  const result = await syncOfflineCardCaptures({
    userId: access.actor.userId,
    online: true,
  });

  return NextResponse.json({ ok: true, ...result });
}
