import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";
import {
  fetchDoorDashOrders,
  getDoorDashCapabilitySnapshot,
  getDoorDashPlaceholderMessage,
  syncMenuToDoorDash,
} from "@/services/integrations/doordash/doordash-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return runCronRoute(request, async () => {
    const capability = getDoorDashCapabilitySnapshot();

    if (!capability.hasCredentials) {
      return NextResponse.json({
        ok: false,
        skipped: true,
        code: "doordash_not_configured",
        message: getDoorDashPlaceholderMessage(false),
      });
    }

    if (capability.placeholderMode) {
      return NextResponse.json({
        ok: false,
        skipped: true,
        code: "doordash_not_configured",
        message: getDoorDashPlaceholderMessage(false),
      });
    }

    try {
      const systemUserId = process.env.DOORDASH_CRON_OWNER_USER_ID?.trim();
      if (!systemUserId) {
        return NextResponse.json({
          ok: false,
          skipped: true,
          code: "doordash_cron_owner_missing",
          message: "Set DOORDASH_CRON_OWNER_USER_ID for scheduled marketplace import.",
        });
      }

      const result = await fetchDoorDashOrders(systemUserId);

      let menuSync: { ok: boolean; itemsCount?: number; message?: string } | null = null;
      if (process.env.DOORDASH_MENU_SYNC_ON_CRON !== "0") {
        try {
          const synced = await syncMenuToDoorDash(systemUserId);
          menuSync = {
            ok: true,
            itemsCount: synced.itemsCount,
            message: synced.message,
          };
        } catch (e) {
          menuSync = {
            ok: false,
            message: e instanceof Error ? e.message : "DoorDash menu sync failed",
          };
        }
      }

      return NextResponse.json({
        ok: true,
        imported: result.imported,
        total: result.total,
        menuSync,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "DoorDash sync failed";
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
  });
}
