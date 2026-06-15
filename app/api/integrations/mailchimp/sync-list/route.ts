import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { syncCustomersToMailchimpList } from "@/services/integrations/mailchimp/list-sync.service";
import { updateMailchimpLiveSettings } from "@/services/integrations/mailchimp/mailchimp-live-service";

export async function POST(request: Request) {
  const { dataUserId } = await requireTenantActor();
  const body = (await request.json().catch(() => ({}))) as {
    days?: number;
    limit?: number;
    listId?: string;
  };

  const result = await syncCustomersToMailchimpList(dataUserId, body);

  if (result.synced > 0) {
    await updateMailchimpLiveSettings(dataUserId, {
      lastListSyncAt: new Date().toISOString(),
      lastListSyncCount: result.synced,
      selectedListId: body.listId,
    });
  }

  return NextResponse.json(result, { status: result.ok || result.synced > 0 ? 200 : 400 });
}
