import {
  CustomerSource,
  CustomerStatus,
  CustomerTimelineEventType,
  CustomerType,
  Prisma,
} from "@prisma/client";

import { dedupeKeys, normalizeEmail, normalizePhone } from "@/lib/crm/customer-dedupe";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { whereOrdersForOwnerAnd } from "@/lib/analytics/revenue-metrics";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  kitchenCustomerByIdWhereForOwner,
  kitchenCustomerListWhereForOwner,
} from "@/lib/scope/workspace-customer-scope";

export type CustomerScope = { userId: string; workspaceId?: string | null };

export type UpsertCustomerInput = {
  userId: string;
  workspaceId?: string | null;
  email: string;
  name?: string | null;
  phone?: string | null;
  source?: CustomerSource;
  sourceChannelId?: string | null;
  externalCustomerId?: string | null;
  preferredBrandId?: string | null;
  preferredLocationId?: string | null;
  type?: CustomerType;
  status?: CustomerStatus;
  companyName?: string | null;
  appendTimelineEvent?: {
    eventType: CustomerTimelineEventType;
    sourceType?: string | null;
    sourceId?: string | null;
    summary?: string | null;
    metadataJson?: Prisma.InputJsonValue;
  };
};

/**
 * Idempotent — used both by the manual "Add customer" form and by every
 * channel ingest hook (orders, storefront, channel imports, CSV). Never
 * overwrites a manually-set field with an empty incoming value.
 */
export async function upsertCustomerByEmail(input: UpsertCustomerInput) {
  const email = normalizeEmail(input.email);
  if (!email) throw new Error("Email is required to upsert a customer.");

  const phone = normalizePhone(input.phone);
  const name = (input.name ?? "").trim() || null;
  const workspaceId = input.workspaceId ?? (await resolveOwnerWorkspaceId(input.userId));

  const existing = await prisma.kitchenCustomer.findUnique({
    where: { userId_email: { userId: input.userId, email } },
  });

  const baseUpdate: Prisma.KitchenCustomerUpdateInput = {};
  if (name && !existing?.name) baseUpdate.name = name;
  if (phone && !existing?.phone) baseUpdate.phone = phone;
  if (input.companyName && !existing?.companyName) baseUpdate.companyName = input.companyName;
  if (input.preferredBrandId !== undefined && !existing?.preferredBrandId) {
    baseUpdate.preferredBrandId = input.preferredBrandId;
  }
  if (input.preferredLocationId !== undefined && !existing?.preferredLocationId) {
    baseUpdate.preferredLocationId = input.preferredLocationId;
  }
  if (input.externalCustomerId && !existing?.externalCustomerId) {
    baseUpdate.externalCustomerId = input.externalCustomerId;
  }
  // Don't downgrade source — keep the earliest non-MANUAL source.
  if (input.source && (!existing || existing.source === "MANUAL")) {
    baseUpdate.source = input.source;
    if (input.sourceChannelId) baseUpdate.sourceChannelId = input.sourceChannelId;
  }
  if (input.type && (!existing || existing.type === "INDIVIDUAL")) {
    baseUpdate.type = input.type;
  }
  if (input.status) baseUpdate.status = input.status;
  if (workspaceId && !existing?.workspaceId) {
    baseUpdate.workspace = { connect: { id: workspaceId } };
  }

  const customer = existing
    ? await prisma.kitchenCustomer.update({ where: { id: existing.id }, data: baseUpdate })
    : await prisma.kitchenCustomer.create({
        data: {
          userId: input.userId,
          workspaceId,
          email,
          name,
          phone,
          companyName: input.companyName ?? null,
          source: input.source ?? "MANUAL",
          sourceChannelId: input.sourceChannelId ?? null,
          externalCustomerId: input.externalCustomerId ?? null,
          preferredBrandId: input.preferredBrandId ?? null,
          preferredLocationId: input.preferredLocationId ?? null,
          type: input.type ?? "INDIVIDUAL",
          status: input.status ?? (existing ? "ACTIVE" : "NEW"),
        },
      });

  if (input.appendTimelineEvent) {
    await prisma.customerTimelineEvent.create({
      data: {
        customerId: customer.id,
        eventType: input.appendTimelineEvent.eventType,
        sourceType: input.appendTimelineEvent.sourceType ?? null,
        sourceId: input.appendTimelineEvent.sourceId ?? null,
        summary: input.appendTimelineEvent.summary ?? null,
        metadataJson: input.appendTimelineEvent.metadataJson ?? undefined,
      },
    });
  } else if (!existing) {
    await prisma.customerTimelineEvent.create({
      data: {
        customerId: customer.id,
        eventType: "CUSTOMER_CREATED",
        sourceType: "service",
        summary: `Created via ${customer.source}`,
      },
    });
  }

  return customer;
}

/**
 * Public integration hook used by the Order Hub / storefront / channel
 * ingest. Never throws — failures are logged and swallowed so they cannot
 * block order creation.
 */
export async function upsertCustomerFromOrder(args: {
  userId: string;
  email: string | null | undefined;
  name?: string | null;
  phone?: string | null;
  source?: CustomerSource;
  brandId?: string | null;
  locationId?: string | null;
  orderId?: string | null;
  orderTotal?: number | null;
  marketingConsent?: boolean;
}): Promise<void> {
  try {
    if (!args.email) return;
    const customer = await upsertCustomerByEmail({
      userId: args.userId,
      email: args.email,
      name: args.name ?? null,
      phone: args.phone ?? null,
      source: args.source ?? "MANUAL",
      preferredBrandId: args.brandId ?? undefined,
      preferredLocationId: args.locationId ?? undefined,
      appendTimelineEvent: {
        eventType: "ORDER_PLACED",
        sourceType: "order",
        sourceId: args.orderId ?? null,
        summary:
          args.orderTotal != null
            ? `Order placed — $${args.orderTotal.toFixed(2)}`
            : "Order placed",
      },
    });
    if (args.marketingConsent) {
      await prisma.kitchenCustomer.update({
        where: { id: customer.id },
        data: { marketingConsent: true },
      });
    }
  } catch (error) {
    // Surface to server logs but never block the calling action.
    logger.warn("[crm] upsertCustomerFromOrder failed", error);
  }
}

export async function listCustomersForUser(
  scope: CustomerScope,
  options?: {
    status?: CustomerStatus;
    type?: CustomerType;
    source?: CustomerSource;
    search?: string;
    take?: number;
  },
) {
  const scopeWhere = await kitchenCustomerListWhereForOwner(scope.userId);
  const and: Prisma.KitchenCustomerWhereInput[] = [scopeWhere];
  if (options?.status) and.push({ status: options.status });
  if (options?.type) and.push({ type: options.type });
  if (options?.source) and.push({ source: options.source });
  if (options?.search && options.search.trim().length > 0) {
    const q = options.search.trim();
    and.push({
      OR: [
        { email: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
        { companyName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
      ],
    });
  }
  return prisma.kitchenCustomer.findMany({
    where: { AND: and },
    orderBy: [{ lifetimeValueCents: "desc" }, { lastOrderAt: "desc" }],
    take: options?.take ?? 200,
  });
}

export async function getCustomerForUser(scope: CustomerScope, customerId: string) {
  return prisma.kitchenCustomer.findFirst({
    where: await kitchenCustomerByIdWhereForOwner(scope.userId, customerId),
    include: {
      addresses: true,
      crmNotes: { orderBy: { createdAt: "desc" }, take: 50 },
      timelineEvents: { orderBy: { createdAt: "desc" }, take: 60 },
      segmentMemberships: { include: { segment: true } },
      followUps: { orderBy: { createdAt: "desc" }, take: 30 },
      consentEvents: { orderBy: { createdAt: "desc" }, take: 30 },
      companyAccount: true,
      subscriptions: { orderBy: { createdAt: "desc" } },
    },
  });
}

/** Find orders linked by email (since Order has no FK to KitchenCustomer). */
export async function listOrdersForCustomer(scope: CustomerScope, email: string, take = 50) {
  return prisma.order.findMany({
    where: await whereOrdersForOwnerAnd(scope.userId, {
      customerEmail: { equals: email, mode: "insensitive" },
    }),
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      total: true,
      status: true,
      fulfillmentType: true,
      createdAt: true,
      brandId: true,
      locationId: true,
      isChannelTestOrder: true,
    },
  });
}

/**
 * Backfill `kitchen_customers` from existing `Order` rows for workspaces that
 * predate the CRM upsert hook. Idempotent: only inserts customers that don't
 * exist yet; never overwrites manually-edited fields.
 */
export async function backfillCustomersFromOrders(userId: string): Promise<{ created: number }> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  const orderScope = await whereOrdersForOwnerAnd(userId, {});
  const grouped = await prisma.order.groupBy({
    by: ["customerEmail"],
    where: orderScope,
    _min: { customerName: true, customerPhone: true, createdAt: true },
  });
  let created = 0;
  for (const g of grouped) {
    const email = normalizeEmail(g.customerEmail);
    if (!email) continue;
    const exists = await prisma.kitchenCustomer.findUnique({
      where: { userId_email: { userId, email } },
      select: { id: true },
    });
    if (exists) continue;
    await prisma.kitchenCustomer.create({
      data: {
        userId,
        workspaceId,
        email,
        name: g._min.customerName ?? null,
        phone: normalizePhone(g._min.customerPhone),
        status: "ACTIVE",
        source: "MANUAL",
      },
    });
    created += 1;
  }
  return { created };
}

/** Find customers whose dedupe keys overlap. */
export async function findDuplicateGroups(scope: CustomerScope, take = 500) {
  const customers = await prisma.kitchenCustomer.findMany({
    where: await kitchenCustomerListWhereForOwner(scope.userId),
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      email: true,
      phone: true,
      name: true,
      companyName: true,
      externalCustomerId: true,
      createdAt: true,
    },
  });

  const groups = new Map<string, typeof customers>();
  for (const c of customers) {
    for (const key of dedupeKeys({ email: c.email, phone: c.phone, name: c.name, externalCustomerId: c.externalCustomerId })) {
      const k = `${key.kind}:${key.value}`;
      const list = groups.get(k) ?? [];
      list.push(c);
      groups.set(k, list);
    }
  }
  return [...groups.entries()].filter(([, members]) => members.length > 1).map(([key, members]) => ({ key, members }));
}

export async function archiveCustomer(scope: CustomerScope, customerId: string) {
  const existing = await getCustomerForUser(scope, customerId);
  if (!existing) throw new Error("Customer not found.");
  await prisma.kitchenCustomer.update({
    where: { id: existing.id },
    data: { status: "ARCHIVED" },
  });
  await prisma.customerTimelineEvent.create({
    data: { customerId: existing.id, eventType: "CUSTOMER_UPDATED", summary: "Archived" },
  });
}
