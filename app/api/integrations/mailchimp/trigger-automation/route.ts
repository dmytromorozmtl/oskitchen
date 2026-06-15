import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { triggerMailchimpCampaignAutomation } from "@/services/integrations/mailchimp/campaign-automation.service";
import { updateMailchimpLiveSettings } from "@/services/integrations/mailchimp/mailchimp-live-service";

export async function GET() {
  const { dataUserId } = await requireTenantActor();
  const { listMailchimpCampaignAutomations } = await import(
    "@/services/integrations/mailchimp/campaign-automation.service"
  );
  const result = await listMailchimpCampaignAutomations(dataUserId);
  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, automations: result.automations });
}

export async function POST(request: Request) {
  const { dataUserId } = await requireTenantActor();
  const body = (await request.json().catch(() => ({}))) as {
    automationId?: string;
    listId?: string;
    limit?: number;
  };

  if (!body.automationId?.trim()) {
    return NextResponse.json({ ok: false, message: "automationId is required." }, { status: 400 });
  }

  const result = await triggerMailchimpCampaignAutomation({
    userId: dataUserId,
    automationId: body.automationId.trim(),
    listId: body.listId,
    limit: body.limit,
  });

  if (result.triggered > 0) {
    await updateMailchimpLiveSettings(dataUserId, {
      lastAutomationTriggerAt: new Date().toISOString(),
      lastAutomationTriggered: result.triggered,
      selectedAutomationId: body.automationId.trim(),
      selectedListId: body.listId,
    });
  }

  return NextResponse.json(result, { status: result.ok || result.triggered > 0 ? 200 : 400 });
}
