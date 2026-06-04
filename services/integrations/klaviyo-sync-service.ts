import { subDays } from "date-fns";

import type { KlaviyoCustomerInput, KlaviyoProfileRow, KlaviyoSyncResult } from "@/lib/integrations/klaviyo-types";
import { REVENUE_STATUSES } from "@/lib/analytics/revenue-metrics";
import { hasMarketingEmailConsent } from "@/lib/marketing/marketing-email-consent";
import { prisma } from "@/lib/prisma";
import { customerListWhereForOwner } from "@/lib/scope/workspace-customer-scope";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";

const KLAVIYO_BASE = "https://a.klaviyo.com/api";
const API_REVISION = "2024-10-15";

export function isKlaviyoSyncConfigured(): boolean {
  return Boolean(process.env.KLAVIYO_API_KEY?.trim());
}

export function getKlaviyoConfigError(): string | null {
  if (!process.env.KLAVIYO_API_KEY?.trim()) return "Set KLAVIYO_API_KEY";
  return null;
}

export function buildKlaviyoProfileRow(
  customer: KlaviyoCustomerInput,
): KlaviyoProfileRow | null {
  const email = customer.email.trim().toLowerCase();
  if (!email || !email.includes("@")) return null;

  return {
    email,
    firstName: customer.firstName ?? undefined,
    lastName: customer.lastName ?? undefined,
    phone: customer.phone ?? undefined,
    externalId: customer.id,
    properties: {
      os_kitchen_customer_id: customer.id,
      display_name: customer.displayName ?? customer.email,
      order_count: customer.orderCount ?? 0,
      lifetime_spend: customer.lifetimeSpend ?? 0,
      source: "os_kitchen",
    },
  };
}

export { hasMarketingEmailConsent };

async function upsertKlaviyoProfile(row: KlaviyoProfileRow): Promise<{ ok: true } | { ok: false; error: string }> {
  const key = process.env.KLAVIYO_API_KEY?.trim();
  if (!key) return { ok: false, error: "KLAVIYO_API_KEY not set" };

  const res = await fetch(`${KLAVIYO_BASE}/profiles/`, {
    method: "POST",
    headers: {
      Authorization: `Klaviyo-API-Key ${key}`,
      "Content-Type": "application/json",
      revision: API_REVISION,
    },
    body: JSON.stringify({
      data: {
        type: "profile",
        attributes: {
          email: row.email,
          first_name: row.firstName ?? undefined,
          last_name: row.lastName ?? undefined,
          phone_number: row.phone ?? undefined,
          external_id: row.externalId,
          properties: row.properties,
        },
      },
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: text || `Klaviyo ${res.status}` };
  }
  return { ok: true };
}

export async function syncCustomersToKlaviyo(
  userId: string,
  opts?: { days?: number; limit?: number },
): Promise<KlaviyoSyncResult> {
  const configError = getKlaviyoConfigError();
  if (configError) {
    return { ok: false, synced: 0, skipped: 0, failed: 0, message: configError };
  }

  const days = opts?.days ?? 90;
  const limit = opts?.limit ?? 500;
  const since = subDays(new Date(), days);
  const customerScope = await customerListWhereForOwner(userId);

  const customers = await prisma.kitchenCustomer.findMany({
    where: {
      AND: [
        customerScope,
        { status: "ACTIVE", updatedAt: { gte: since } },
      ],
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
    const input: KlaviyoCustomerInput = {
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

    const row = buildKlaviyoProfileRow(input);
    if (!row) {
      skipped += 1;
      continue;
    }

    const result = await upsertKlaviyoProfile(row);
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
    message: `Synced ${synced} profiles (${skipped} skipped, ${failed} failed)`,
    errors: errors.length ? errors : undefined,
  };
}
