import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  exportReservationsToOpenTable,
  importReservationsFromOpenTable,
} from "@/services/integrations/opentable-sync-service";

export async function POST(request: Request) {
  const { dataUserId } = await requireTenantActor();
  const body = (await request.json().catch(() => ({}))) as {
    direction?: string;
    storefrontId?: string;
  };

  if (!body.storefrontId?.trim()) {
    return NextResponse.json({ ok: false, message: "storefrontId required" }, { status: 400 });
  }

  const result =
    body.direction === "export"
      ? await exportReservationsToOpenTable(dataUserId, body.storefrontId)
      : await importReservationsFromOpenTable(dataUserId, body.storefrontId);

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
