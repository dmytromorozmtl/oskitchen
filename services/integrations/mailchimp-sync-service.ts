import { createHash } from "node:crypto";

import { subDays } from "date-fns";

import type {
  MailchimpCustomerInput,
  MailchimpMemberRow,
  MailchimpSyncResult,
} from "@/lib/integrations/mailchimp-types";
import { REVENUE_STATUSES } from "@/lib/analytics/revenue-metrics";
import { hasMarketingEmailConsent } from "@/lib/marketing/marketing-email-consent";
import { prisma } from "@/lib/prisma";
import { kitchenCustomerListWhereForOwner } from "@/lib/scope/workspace-customer-scope";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";

export function parseMailchimpDatacenter(apiKey: string): string | null {
  const parts = apiKey.trim().split("-");
  const dc = parts[parts.length - 1];
  return dc && /^[a-z]{2}\d+$/i.test(dc) ? dc.toLowerCase() : null;
}

export function mailchimpSubscriberHash(email: string): string {
  return createHash("md5").update(email.trim().toLowerCase()).digest("hex");
}

export function isMailchimpSyncConfigured(): boolean {
  return Boolean(
    process.env.MAILCHIMP_API_KEY?.trim() && process.env.MAILCHIMP_LIST_ID?.trim(),
  );
}

export function getMailchimpConfigError(): string | null {
  if (!process.env.MAILCHIMP_API_KEY?.trim()) return "Set MAILCHIMP_API_KEY";
  if (!process.env.MAILCHIMP_LIST_ID?.trim()) return "Set MAILCHIMP_LIST_ID";
  if (!parseMailchimpDatacenter(process.env.MAILCHIMP_API_KEY)) {
    return "MAILCHIMP_API_KEY must include datacenter suffix (e.g. -us21)";
  }
  return null;
}

export function buildMailchimpMemberRow(
  customer: MailchimpCustomerInput,
): MailchimpMemberRow | null {
  const email = customer.email.trim().toLowerCase();
  if (!email || !email.includes("@")) return null;

  return {
    email,
    firstName: customer.firstName ?? undefined,
    lastName: customer.lastName ?? undefined,
    phone: customer.phone ?? undefined,
    externalId: customer.id,
    orderCount: customer.orderCount ?? 0,
    lifetimeSpend: customer.lifetimeSpend ?? 0,
  };
}

async function upsertMailchimpMember(
  row: MailchimpMemberRow,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.MAILCHIMP_API_KEY?.trim();
  const listId = process.env.MAILCHIMP_LIST_ID?.trim();
  if (!apiKey || !listId) return { ok: false, error: "Mailchimp not configured" };

  const dc = parseMailchimpDatacenter(apiKey);
  if (!dc) return { ok: false, error: "Invalid MAILCHIMP_API_KEY datacenter suffix" };

  const hash = mailchimpSubscriberHash(row.email);
  const auth = Buffer.from(`anystring:${apiKey}`).toString("base64");

  const res = await fetch(
    `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members/${hash}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: row.email,
        status_if_new: "subscribed",
        merge_fields: {
          FNAME: row.firstName ?? "",
          LNAME: row.lastName ?? "",
          PHONE: row.phone ?? "",
        },
        tags: ["os_kitchen", "os_kitchen_sync"],
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

export async function syncCustomersToMailchimp(
  userId: string,
  opts?: { days?: number; limit?: number },
): Promise<MailchimpSyncResult> {
  const configError = getMailchimpConfigError();
  if (configError) {
    return { ok: false, synced: 0, skipped: 0, failed: 0, message: configError };
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

    const result = await upsertMailchimpMember(row);
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

export { hasMarketingEmailConsent };
