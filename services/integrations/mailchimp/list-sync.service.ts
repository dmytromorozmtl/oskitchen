import { createHash } from "node:crypto";

import { subDays } from "date-fns";

import type {
  MailchimpCustomerInput,
  MailchimpSyncResult,
} from "@/lib/integrations/mailchimp-types";
import { REVENUE_STATUSES } from "@/lib/analytics/revenue-metrics";
import { hasMarketingEmailConsent } from "@/lib/marketing/marketing-email-consent";
import { prisma } from "@/lib/prisma";
import { kitchenCustomerListWhereForOwner } from "@/lib/scope/workspace-customer-scope";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";
import { buildMailchimpMemberRow } from "@/services/integrations/mailchimp-sync-service";
import { mailchimpOAuthHeaders } from "@/services/integrations/mailchimp/mailchimp-api";
import { getMailchimpCredentials } from "@/services/integrations/mailchimp/mailchimp-credentials";
import { ensureMailchimpConnection } from "@/services/integrations/mailchimp/mailchimp-live-service";

function subscriberHash(email: string): string {
  return createHash("md5").update(email.trim().toLowerCase()).digest("hex");
}

async function upsertOAuthMember(input: {
  apiEndpoint: string;
  accessToken: string;
  listId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const hash = subscriberHash(input.email);
  const res = await fetch(
    `${input.apiEndpoint}/3.0/lists/${input.listId}/members/${hash}`,
    {
      method: "PUT",
      headers: mailchimpOAuthHeaders(input.accessToken),
      body: JSON.stringify({
        email_address: input.email,
        status_if_new: "subscribed",
        merge_fields: {
          FNAME: input.firstName ?? "",
          LNAME: input.lastName ?? "",
          PHONE: input.phone ?? "",
        },
        tags: ["os_kitchen", "os_kitchen_live"],
      }),
      signal: AbortSignal.timeout(15_000),
    },
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: text || `Mailchimp ${res.status}` };
  }
  return { ok: true };
}

export async function syncCustomersToMailchimpList(
  userId: string,
  opts?: { days?: number; limit?: number; listId?: string },
): Promise<MailchimpSyncResult> {
  const conn = await ensureMailchimpConnection(userId);
  const creds = getMailchimpCredentials(conn);
  if (!creds?.accessToken || !creds.apiEndpoint) {
    return { ok: false, synced: 0, skipped: 0, failed: 0, message: "Connect Mailchimp via OAuth first." };
  }

  const listId = opts?.listId?.trim() || creds.listId;
  if (!listId) {
    return { ok: false, synced: 0, skipped: 0, failed: 0, message: "Select a Mailchimp audience list." };
  }

  const days = opts?.days ?? 90;
  const limit = opts?.limit ?? 500;
  const since = subDays(new Date(), days);
  const customerScope = await kitchenCustomerListWhereForOwner(userId);

  const customers = await prisma.kitchenCustomer.findMany({
    where: {
      AND: [customerScope, { status: "ACTIVE", updatedAt: { gte: since } }],
    },
    include: {
      consentEvents: { orderBy: { createdAt: "desc" }, take: 10 },
    },
    take: limit,
    orderBy: { updatedAt: "desc" },
  });

  const orderWhere = await orderListWhereForOwnerAnd(userId, {
    status: { in: REVENUE_STATUSES },
  });
  const orderAgg = await prisma.order.groupBy({
    by: ["customerEmail"],
    where: orderWhere,
    _count: { _all: true },
    _sum: { total: true },
  });
  const statsByEmail = new Map(
    orderAgg.map((row) => [
      (row.customerEmail ?? "").trim().toLowerCase(),
      {
        orderCount: row._count._all,
        lifetimeSpend: Math.round(Number(row._sum.total ?? 0) * 100) / 100,
      },
    ]),
  );

  let synced = 0;
  let skipped = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const customer of customers) {
    const input: MailchimpCustomerInput = {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      displayName: customer.displayName,
      phone: customer.phone,
      consentEvents: customer.consentEvents,
      ...statsByEmail.get(customer.email.trim().toLowerCase()),
    };

    if (!hasMarketingEmailConsent(input.consentEvents)) {
      skipped += 1;
      continue;
    }

    const row = buildMailchimpMemberRow(input);
    if (!row) {
      skipped += 1;
      continue;
    }

    const result = await upsertOAuthMember({
      apiEndpoint: creds.apiEndpoint,
      accessToken: creds.accessToken,
      listId,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      phone: row.phone,
    });

    if (result.ok) {
      synced += 1;
    } else {
      failed += 1;
      if (errors.length < 5) errors.push(`${row.email}: ${result.error}`);
    }
  }

  return {
    ok: failed === 0,
    synced,
    skipped,
    failed,
    message: `Synced ${synced} members (${skipped} skipped, ${failed} failed)`,
    errors: errors.length ? errors : undefined,
  };
}
