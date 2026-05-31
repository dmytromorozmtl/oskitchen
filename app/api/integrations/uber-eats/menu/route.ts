import { NextResponse } from "next/server";

import { requireIntegrationsActor } from "@/lib/integrations/require-integrations-actor";
import { syncMenuToUberEats } from "@/services/integrations/uber-eats/uber-eats-service";

export async function PUT(request: Request) {
  const gate = await requireIntegrationsActor({ operation: "integrations.uber_eats_menu_sync" });
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: 403 });
  }

  let locationId: string | undefined;
  try {
    const body = (await request.json()) as { locationId?: string };
    locationId = body.locationId;
  } catch {
    locationId = undefined;
  }

  try {
    const result = await syncMenuToUberEats(gate.actor.userId, locationId ?? null);
    return NextResponse.json({
      ok: true,
      categoriesCount: result.categoriesCount,
      itemsCount: result.itemsCount,
      message: result.message,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Menu sync failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
