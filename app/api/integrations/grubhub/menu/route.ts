import { NextResponse } from "next/server";

import { requireIntegrationsActor } from "@/lib/integrations/require-integrations-actor";
import { syncMenuToGrubhub } from "@/services/integrations/grubhub/grubhub-service";

export async function PUT(request: Request) {
  const gate = await requireIntegrationsActor({ operation: "integrations.grubhub_menu_sync" });
  if (!gate.ok) {
    return NextResponse.json({ error: gate.error }, { status: 403 });
  }

  let menuId: string | undefined;
  try {
    const body = (await request.json()) as { menuId?: string };
    menuId = body.menuId;
  } catch {
    menuId = undefined;
  }

  try {
    const result = await syncMenuToGrubhub(gate.actor.userId, menuId);
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
