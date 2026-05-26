import { NextResponse } from "next/server";

import { runCronRoute } from "@/lib/api/run-cron";
import {
  getDoorDashCapabilitySnapshot,
  getDoorDashPlaceholderMessage,
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
        code: "doordash_placeholder",
        message: getDoorDashPlaceholderMessage(true),
      });
    }

    return NextResponse.json({
      ok: false,
      skipped: true,
      code: "doordash_placeholder",
      message: getDoorDashPlaceholderMessage(true),
    });
  });
}
