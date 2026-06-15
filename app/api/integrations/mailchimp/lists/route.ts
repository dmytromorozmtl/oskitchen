import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { fetchMailchimpLists } from "@/services/integrations/mailchimp/mailchimp-api";
import { getMailchimpCredentials } from "@/services/integrations/mailchimp/mailchimp-credentials";
import { ensureMailchimpConnection } from "@/services/integrations/mailchimp/mailchimp-live-service";

export async function GET() {
  const { dataUserId } = await requireTenantActor();
  const conn = await ensureMailchimpConnection(dataUserId);
  const creds = getMailchimpCredentials(conn);

  if (!creds?.accessToken || !creds.apiEndpoint) {
    return NextResponse.json({ ok: false, message: "Connect Mailchimp via OAuth first." }, { status: 400 });
  }

  const lists = await fetchMailchimpLists(creds.apiEndpoint, creds.accessToken);
  return NextResponse.json({ ok: true, lists });
}
