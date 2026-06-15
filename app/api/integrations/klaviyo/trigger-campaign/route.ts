import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  isValidKlaviyoCampaignFlow,
  triggerKlaviyoCampaignBatch,
  triggerKlaviyoCampaignForSegment,
} from "@/services/integrations/klaviyo/campaign-triggers.service";
import { updateKlaviyoLiveSettings } from "@/services/integrations/klaviyo/klaviyo-live-service";

export async function POST(request: Request) {
  const { dataUserId } = await requireTenantActor();
  const body = (await request.json().catch(() => ({}))) as {
    flow?: string;
    emails?: string[];
    segmentId?: string;
    limit?: number;
  };

  if (!body.flow || !isValidKlaviyoCampaignFlow(body.flow)) {
    return NextResponse.json({ ok: false, message: "Invalid campaign flow." }, { status: 400 });
  }

  const result = body.segmentId
    ? await triggerKlaviyoCampaignForSegment({
        flow: body.flow,
        segmentId: body.segmentId,
        limit: body.limit,
      })
    : await triggerKlaviyoCampaignBatch({
        flow: body.flow,
        emails: body.emails ?? [],
      });

  if (result.triggered > 0) {
    await updateKlaviyoLiveSettings(dataUserId, {
      lastCampaignTriggerAt: new Date().toISOString(),
      lastCampaignFlow: body.flow,
      lastCampaignTriggered: result.triggered,
    });
  }

  return NextResponse.json(result, { status: result.ok || result.triggered > 0 ? 200 : 400 });
}
