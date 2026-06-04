import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";
import {
  fetchGrubhubOrders,
  getGrubhubCapabilitySnapshot,
  getGrubhubBetaMessage,
  syncMenuToGrubhub,
} from "@/services/integrations/grubhub/grubhub-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return runCronRoute(request, async () => {
    const capability = getGrubhubCapabilitySnapshot();

    if (!capability.hasCredentials || capability.placeholderMode) {
      return NextResponse.json({
        ok: false,
        skipped: true,
        code: "grubhub_not_configured",
        message: getGrubhubBetaMessage(false),
      });
    }

    try {
      const systemUserId = process.env.GRUBHUB_CRON_OWNER_USER_ID?.trim();
      if (!systemUserId) {
        return NextResponse.json({
          ok: false,
          skipped: true,
          code: "grubhub_cron_owner_missing",
          message: "Set GRUBHUB_CRON_OWNER_USER_ID for scheduled marketplace import.",
        });
      }

      const result = await fetchGrubhubOrders(systemUserId);

      let menuSync: { ok: boolean; itemsCount?: number; message?: string } | null = null;
      if (process.env.GRUBHUB_MENU_SYNC_ON_CRON !== "0") {
        try {
          const synced = await syncMenuToGrubhub(systemUserId);
          menuSync = {
            ok: true,
            itemsCount: synced.itemsCount,
            message: synced.message,
          };
        } catch (e) {
          menuSync = {
            ok: false,
            message: e instanceof Error ? e.message : "Grubhub menu sync failed",
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
      const message = e instanceof Error ? e.message : "Grubhub sync failed";
      return NextResponse.json({ ok: false, error: message }, { status: 500 });
    }
  });
}
