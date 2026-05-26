import {
  CateringQuoteAuditEventType,
  type CateringQuote,
  type CateringQuoteItem,
  type CateringQuoteLineType,
  type CateringQuoteStatus,
  type CateringEventType,
  type CateringPricingMode,
  type CateringServiceStyle,
  CustomerTimelineEventType,
  Prisma,
} from "@prisma/client";

import { computeQuoteTotals, decimalToNumber } from "@/lib/catering/quote-calculations";
import { generatePublicProposalToken } from "@/lib/catering/proposal-public-links";
import { canTransitionQuoteStatus } from "@/lib/catering/quote-status";
import {
  cateringQuoteByIdWhereForOwner,
  cateringQuoteListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { upsertCustomerByEmail } from "@/services/crm/customer-service";

type Scope = { userId: string };

async function quoteOwnerWhere(
  userId: string,
  extra?: Prisma.CateringQuoteWhereInput,
): Promise<Prisma.CateringQuoteWhereInput> {
  const base = await cateringQuoteListWhereForOwner(userId);
  return extra ? ({ AND: [base, extra] } as Prisma.CateringQuoteWhereInput) : base;
}

export type CreateQuoteInput = {
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  companyName?: string | null;
  customerId?: string | null;
  companyAccountId?: string | null;
  brandId?: string | null;
  locationId?: string | null;
  eventName?: string | null;
  eventType?: CateringEventType;
  serviceStyle?: CateringServiceStyle;
  pricingMode?: CateringPricingMode;
  eventDate?: Date | null;
  eventStartTime?: Date | null;
  eventEndTime?: Date | null;
  guestCount?: number | null;
  eventAddressJson?: Record<string, unknown> | null;
  deliveryRequired?: boolean;
  setupRequired?: boolean;
  staffingRequired?: boolean;
  dietaryNotes?: string | null;
  allergyNotes?: string | null;
  internalNotes?: string | null;
  clientNotes?: string | null;
  notes?: string | null;
  budget?: number | null;
  validUntil?: Date | null;
  status?: CateringQuoteStatus;
  serviceFee?: number;
  deliveryFee?: number;
  setupFee?: number;
  staffingFee?: number;
  discount?: number;
  tax?: number;
  starterLine?: {
    title: string;
    quantity: number;
    unitPrice: number;
    lineType?: CateringQuoteLineType;
  } | null;
  performedBy?: string | null;
};

async function nextQuoteNumber(userId: string): Promise<string> {
  const year = new Date().getUTCFullYear();
  const prefix = `Q-${year}-`;
  const scope = await cateringQuoteListWhereForOwner(userId);
  const last = await prisma.cateringQuote.findFirst({
    where: { AND: [scope, { quoteNumber: { startsWith: prefix } }] },
    orderBy: { quoteNumber: "desc" },
    select: { quoteNumber: true },
  });
  let n = 1;
  if (last?.quoteNumber) {
    const tail = last.quoteNumber.slice(prefix.length);
    const parsed = Number.parseInt(tail, 10);
    if (Number.isFinite(parsed) && parsed >= 0) n = parsed + 1;
  }
  return `${prefix}${String(n).padStart(4, "0")}`;
}

function dec(value: number | null | undefined): Prisma.Decimal {
  return new Prisma.Decimal((value ?? 0).toFixed(2));
}

export async function createQuote(input: CreateQuoteInput): Promise<CateringQuote> {
  const customer = await upsertCustomerByEmail({
    userId: input.userId,
    email: input.customerEmail,
    name: input.customerName,
    phone: input.customerPhone ?? null,
    companyName: input.companyName ?? null,
    source: "CATERING_QUOTE",
    type: input.companyName ? "CATERING_CLIENT" : "INDIVIDUAL",
  }).catch(() => null);

  const quoteNumber = await nextQuoteNumber(input.userId);
  const token = generatePublicProposalToken();
  const lineTotal = input.starterLine ? input.starterLine.quantity * input.starterLine.unitPrice : 0;

  const totals = computeQuoteTotals(
    input.starterLine ? [{ quantity: input.starterLine.quantity, unitPrice: input.starterLine.unitPrice }] : [],
    {
      serviceFee: input.serviceFee,
      deliveryFee: input.deliveryFee,
      setupFee: input.setupFee,
      staffingFee: input.staffingFee,
      discount: input.discount,
      tax: input.tax,
    },
  );

  const workspaceId = await resolveOwnerWorkspaceId(input.userId);
  const quote = await prisma.cateringQuote.create({
    data: {
      userId: input.userId,
      workspaceId: workspaceId ?? undefined,
      customerName: input.customerName.trim(),
      customerEmail: input.customerEmail.trim().toLowerCase(),
      customerPhone: input.customerPhone ?? null,
      companyName: input.companyName ?? null,
      customerId: input.customerId ?? customer?.id ?? null,
      companyAccountId: input.companyAccountId ?? null,
      brandId: input.brandId ?? null,
      locationId: input.locationId ?? null,
      quoteNumber,
      eventName: input.eventName ?? null,
      eventType: input.eventType ?? "CUSTOM",
      serviceStyle: input.serviceStyle ?? "DROP_OFF",
      pricingMode: input.pricingMode ?? "FIXED",
      eventDate: input.eventDate ?? null,
      eventStartTime: input.eventStartTime ?? null,
      eventEndTime: input.eventEndTime ?? null,
      guestCount: input.guestCount ?? null,
      eventAddressJson:
        (input.eventAddressJson != null
          ? (input.eventAddressJson as Prisma.InputJsonValue)
          : Prisma.JsonNull) as Prisma.InputJsonValue,
      deliveryRequired: input.deliveryRequired ?? false,
      setupRequired: input.setupRequired ?? false,
      staffingRequired: input.staffingRequired ?? false,
      dietaryNotes: input.dietaryNotes ?? null,
      allergyNotes: input.allergyNotes ?? null,
      internalNotes: input.internalNotes ?? null,
      clientNotes: input.clientNotes ?? null,
      notes: input.notes ?? null,
      budget: input.budget != null ? dec(input.budget) : null,
      validUntil: input.validUntil ?? null,
      publicToken: token,
      status: input.status ?? "DRAFT",
      subtotal: dec(totals.subtotal),
      serviceFee: dec(totals.serviceFee),
      deliveryFee: dec(totals.deliveryFee),
      setupFee: dec(totals.setupFee),
      staffingFee: dec(totals.staffingFee),
      discount: dec(totals.discount),
      tax: dec(totals.tax),
      total: dec(totals.total),
      createdBy: input.performedBy ?? null,
      items: input.starterLine
        ? {
            create: {
              title: input.starterLine.title,
              quantity: input.starterLine.quantity,
              unitPrice: dec(input.starterLine.unitPrice),
              total: dec(lineTotal),
              lineType: input.starterLine.lineType ?? "FOOD",
              sortOrder: 0,
            },
          }
        : undefined,
    },
  });

  await prisma.cateringQuoteEvent.create({
    data: {
      quoteId: quote.id,
      eventType: CateringQuoteAuditEventType.QUOTE_CREATED,
      performedBy: input.performedBy ?? null,
      metadataJson: {
        eventType: quote.eventType,
        serviceStyle: quote.serviceStyle,
        quoteNumber,
      } as Prisma.InputJsonValue,
    },
  });

  if (customer) {
    try {
      await prisma.customerTimelineEvent.create({
        data: {
          customerId: customer.id,
          eventType: CustomerTimelineEventType.OTHER,
          sourceType: "catering_quote",
          sourceId: quote.id,
          summary: `Catering quote ${quoteNumber} created`,
        },
      });
    } catch (error) {
      logger.warn("[catering] CRM timeline event failed", error);
    }
  }

  return quote;
}

export async function listQuotesForUser(
  scope: Scope,
  options?: { status?: CateringQuoteStatus | CateringQuoteStatus[]; take?: number },
): Promise<Array<CateringQuote & { items: CateringQuoteItem[] }>> {
  const statusFilter =
    options?.status === undefined
      ? undefined
      : Array.isArray(options.status)
        ? { in: options.status }
        : options.status;
  return prisma.cateringQuote.findMany({
    where: await quoteOwnerWhere(
      scope.userId,
      statusFilter ? { status: statusFilter } : undefined,
    ),
    include: { items: { orderBy: { sortOrder: "asc" } } },
    orderBy: [{ status: "asc" }, { eventDate: "asc" }, { createdAt: "desc" }],
    take: options?.take ?? 200,
  });
}

export async function getQuoteForUser(scope: Scope, quoteId: string) {
  return prisma.cateringQuote.findFirst({
    where: await cateringQuoteByIdWhereForOwner(scope.userId, quoteId),
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      packages: { orderBy: { sortOrder: "asc" } },
      events: { orderBy: { createdAt: "desc" }, take: 100 },
      versions: { orderBy: { versionNumber: "desc" }, take: 20 },
      proposalViews: { orderBy: { viewedAt: "desc" }, take: 10 },
      followUps: { orderBy: { dueAt: "asc" } },
      customer: true,
      companyAccount: true,
      brand: { select: { id: true, name: true, logoUrl: true } },
      location: { select: { id: true, name: true } },
      convertedOrder: { select: { id: true, status: true, total: true } },
    },
  });
}

export async function recomputeQuoteTotals(scope: Scope, quoteId: string) {
  const quote = await prisma.cateringQuote.findFirst({
    where: await cateringQuoteByIdWhereForOwner(scope.userId, quoteId),
    include: { items: true },
  });
  if (!quote) throw new Error("Quote not found.");
  const totals = computeQuoteTotals(
    quote.items.map((i) => ({
      quantity: i.quantity,
      unitPrice: decimalToNumber(i.unitPrice),
      costEstimate: i.costEstimate != null ? decimalToNumber(i.costEstimate) : null,
    })),
    {
      serviceFee: decimalToNumber(quote.serviceFee),
      deliveryFee: decimalToNumber(quote.deliveryFee),
      setupFee: decimalToNumber(quote.setupFee),
      staffingFee: decimalToNumber(quote.staffingFee),
      discount: decimalToNumber(quote.discount),
      tax: decimalToNumber(quote.tax),
    },
  );
  return prisma.cateringQuote.update({
    where: { id: quote.id },
    data: {
      subtotal: dec(totals.subtotal),
      total: dec(totals.total),
      estimatedCost: totals.totalCost != null ? dec(totals.totalCost) : null,
      estimatedMargin: totals.totalMargin != null ? dec(totals.totalMargin) : null,
    },
  });
}

export async function addQuoteLine(
  scope: Scope,
  quoteId: string,
  input: {
    title: string;
    description?: string | null;
    lineType?: CateringQuoteLineType;
    productId?: string | null;
    menuId?: string | null;
    quantity?: number;
    unit?: string | null;
    unitPrice: number;
    costEstimate?: number | null;
    notes?: string | null;
  },
  performedBy?: string | null,
) {
  const quote = await prisma.cateringQuote.findFirst({ where: await cateringQuoteByIdWhereForOwner(scope.userId, quoteId) });
  if (!quote) throw new Error("Quote not found.");
  const qty = input.quantity ?? 1;
  const lineTotal = qty * input.unitPrice;
  const last = await prisma.cateringQuoteItem.findFirst({
    where: { quoteId: quote.id },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  await prisma.cateringQuoteItem.create({
    data: {
      quoteId: quote.id,
      productId: input.productId ?? null,
      menuId: input.menuId ?? null,
      lineType: input.lineType ?? "FOOD",
      title: input.title,
      description: input.description ?? null,
      quantity: qty,
      unit: input.unit ?? null,
      unitPrice: dec(input.unitPrice),
      total: dec(lineTotal),
      costEstimate: input.costEstimate != null ? dec(input.costEstimate) : null,
      sortOrder: (last?.sortOrder ?? -1) + 1,
      notes: input.notes ?? null,
    },
  });
  await prisma.cateringQuoteEvent.create({
    data: {
      quoteId: quote.id,
      eventType: CateringQuoteAuditEventType.QUOTE_UPDATED,
      performedBy: performedBy ?? null,
      metadataJson: { addedLine: input.title } as Prisma.InputJsonValue,
    },
  });
  return recomputeQuoteTotals(scope, quote.id);
}

export async function removeQuoteLine(scope: Scope, lineId: string, performedBy?: string | null) {
  const item = await prisma.cateringQuoteItem.findFirst({
    where: {
      id: lineId,
      quote: await cateringQuoteListWhereForOwner(scope.userId),
    },
    select: { id: true, quoteId: true, title: true },
  });
  if (!item) throw new Error("Line not found.");
  await prisma.cateringQuoteItem.delete({ where: { id: item.id } });
  await prisma.cateringQuoteEvent.create({
    data: {
      quoteId: item.quoteId,
      eventType: CateringQuoteAuditEventType.QUOTE_UPDATED,
      performedBy: performedBy ?? null,
      metadataJson: { removedLine: item.title } as Prisma.InputJsonValue,
    },
  });
  return recomputeQuoteTotals(scope, item.quoteId);
}

export type UpdateQuoteFields = {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string | null;
  companyName?: string | null;
  eventName?: string | null;
  eventType?: CateringEventType;
  serviceStyle?: CateringServiceStyle;
  pricingMode?: CateringPricingMode;
  eventDate?: Date | null;
  eventStartTime?: Date | null;
  eventEndTime?: Date | null;
  guestCount?: number | null;
  deliveryRequired?: boolean;
  setupRequired?: boolean;
  staffingRequired?: boolean;
  dietaryNotes?: string | null;
  allergyNotes?: string | null;
  internalNotes?: string | null;
  clientNotes?: string | null;
  notes?: string | null;
  serviceFee?: number;
  deliveryFee?: number;
  setupFee?: number;
  staffingFee?: number;
  discount?: number;
  tax?: number;
  validUntil?: Date | null;
  brandId?: string | null;
  locationId?: string | null;
};

export async function updateQuoteFields(
  scope: Scope,
  quoteId: string,
  input: UpdateQuoteFields,
  performedBy?: string | null,
) {
  const quote = await prisma.cateringQuote.findFirst({ where: await cateringQuoteByIdWhereForOwner(scope.userId, quoteId) });
  if (!quote) throw new Error("Quote not found.");
  if (["CONVERTED_TO_ORDER", "ARCHIVED"].includes(quote.status)) {
    throw new Error("Quote is terminal — cannot edit.");
  }
  const data: Prisma.CateringQuoteUpdateInput = {};
  if (input.customerName !== undefined) data.customerName = input.customerName.trim();
  if (input.customerEmail !== undefined) data.customerEmail = input.customerEmail.trim().toLowerCase();
  if (input.customerPhone !== undefined) data.customerPhone = input.customerPhone;
  if (input.companyName !== undefined) data.companyName = input.companyName;
  if (input.eventName !== undefined) data.eventName = input.eventName;
  if (input.eventType !== undefined) data.eventType = input.eventType;
  if (input.serviceStyle !== undefined) data.serviceStyle = input.serviceStyle;
  if (input.pricingMode !== undefined) data.pricingMode = input.pricingMode;
  if (input.eventDate !== undefined) data.eventDate = input.eventDate;
  if (input.eventStartTime !== undefined) data.eventStartTime = input.eventStartTime;
  if (input.eventEndTime !== undefined) data.eventEndTime = input.eventEndTime;
  if (input.guestCount !== undefined) data.guestCount = input.guestCount;
  if (input.deliveryRequired !== undefined) data.deliveryRequired = input.deliveryRequired;
  if (input.setupRequired !== undefined) data.setupRequired = input.setupRequired;
  if (input.staffingRequired !== undefined) data.staffingRequired = input.staffingRequired;
  if (input.dietaryNotes !== undefined) data.dietaryNotes = input.dietaryNotes;
  if (input.allergyNotes !== undefined) data.allergyNotes = input.allergyNotes;
  if (input.internalNotes !== undefined) data.internalNotes = input.internalNotes;
  if (input.clientNotes !== undefined) data.clientNotes = input.clientNotes;
  if (input.notes !== undefined) data.notes = input.notes;
  if (input.serviceFee !== undefined) data.serviceFee = dec(input.serviceFee);
  if (input.deliveryFee !== undefined) data.deliveryFee = dec(input.deliveryFee);
  if (input.setupFee !== undefined) data.setupFee = dec(input.setupFee);
  if (input.staffingFee !== undefined) data.staffingFee = dec(input.staffingFee);
  if (input.discount !== undefined) data.discount = dec(input.discount);
  if (input.tax !== undefined) data.tax = dec(input.tax);
  if (input.validUntil !== undefined) data.validUntil = input.validUntil;
  if (input.brandId !== undefined) data.brand = input.brandId ? { connect: { id: input.brandId } } : { disconnect: true };
  if (input.locationId !== undefined) data.location = input.locationId ? { connect: { id: input.locationId } } : { disconnect: true };

  await prisma.cateringQuote.update({ where: { id: quote.id }, data });
  await prisma.cateringQuoteEvent.create({
    data: {
      quoteId: quote.id,
      eventType: CateringQuoteAuditEventType.QUOTE_UPDATED,
      performedBy: performedBy ?? null,
      metadataJson: { keys: Object.keys(input) } as Prisma.InputJsonValue,
    },
  });
  return recomputeQuoteTotals(scope, quote.id);
}

export async function setQuoteStatus(
  scope: Scope,
  quoteId: string,
  next: CateringQuoteStatus,
  performedBy?: string | null,
) {
  const quote = await prisma.cateringQuote.findFirst({ where: await cateringQuoteByIdWhereForOwner(scope.userId, quoteId) });
  if (!quote) throw new Error("Quote not found.");
  if (!canTransitionQuoteStatus(quote.status, next)) {
    throw new Error(`Cannot transition from ${quote.status} to ${next}.`);
  }
  const now = new Date();
  const data: Prisma.CateringQuoteUpdateInput = { status: next };
  if (next === "ACCEPTED") data.acceptedAt = now;
  if (next === "REJECTED" || next === "DECLINED") data.rejectedAt = now;

  await prisma.cateringQuote.update({ where: { id: quote.id }, data });
  await prisma.cateringQuoteEvent.create({
    data: {
      quoteId: quote.id,
      eventType: CateringQuoteAuditEventType.QUOTE_STATUS_CHANGED,
      performedBy: performedBy ?? null,
      metadataJson: { from: quote.status, to: next } as Prisma.InputJsonValue,
    },
  });
  if (quote.customerId) {
    try {
      await prisma.customerTimelineEvent.create({
        data: {
          customerId: quote.customerId,
          eventType: CustomerTimelineEventType.OTHER,
          sourceType: "catering_quote",
          sourceId: quote.id,
          summary: `Catering quote ${quote.quoteNumber ?? quote.id.slice(0, 8)} → ${next}`,
        },
      });
    } catch (error) {
      logger.warn("[catering] CRM timeline event failed", error);
    }
  }
  return next;
}

/* ============================ versions ============================ */

export async function snapshotQuoteVersion(scope: Scope, quoteId: string, performedBy?: string | null, reason?: string | null) {
  const quote = await prisma.cateringQuote.findFirst({
    where: await cateringQuoteByIdWhereForOwner(scope.userId, quoteId),
    include: { items: true, packages: true },
  });
  if (!quote) throw new Error("Quote not found.");
  const latest = await prisma.cateringQuoteVersion.findFirst({
    where: { quoteId: quote.id },
    orderBy: { versionNumber: "desc" },
    select: { versionNumber: true },
  });
  const versionNumber = (latest?.versionNumber ?? 0) + 1;
  await prisma.cateringQuoteVersion.create({
    data: {
      quoteId: quote.id,
      versionNumber,
      createdBy: performedBy ?? null,
      reason: reason ?? null,
      snapshotJson: JSON.parse(JSON.stringify(quote)) as Prisma.InputJsonValue,
    },
  });
  await prisma.cateringQuoteEvent.create({
    data: {
      quoteId: quote.id,
      eventType: CateringQuoteAuditEventType.QUOTE_VERSION_SAVED,
      performedBy: performedBy ?? null,
      metadataJson: { versionNumber } as Prisma.InputJsonValue,
    },
  });
  return versionNumber;
}

/* ============================ public link ============================ */

export async function rotatePublicLink(scope: Scope, quoteId: string, performedBy?: string | null) {
  const quote = await prisma.cateringQuote.findFirst({ where: await cateringQuoteByIdWhereForOwner(scope.userId, quoteId) });
  if (!quote) throw new Error("Quote not found.");
  const token = generatePublicProposalToken();
  await prisma.cateringQuote.update({ where: { id: quote.id }, data: { publicToken: token } });
  await prisma.cateringQuoteEvent.create({
    data: {
      quoteId: quote.id,
      eventType: CateringQuoteAuditEventType.QUOTE_PUBLIC_LINK_GENERATED,
      performedBy: performedBy ?? null,
    },
  });
  return token;
}

export async function revokePublicLink(scope: Scope, quoteId: string, performedBy?: string | null) {
  const quote = await prisma.cateringQuote.findFirst({ where: await cateringQuoteByIdWhereForOwner(scope.userId, quoteId) });
  if (!quote) throw new Error("Quote not found.");
  // Rotate to a guaranteed unique short string ("revoked-…") that no public
  // page expects to find, but keep `publicToken` non-null (it's required).
  const revokedToken = `revoked-${quote.id.slice(0, 8)}-${Date.now()}`;
  await prisma.cateringQuote.update({ where: { id: quote.id }, data: { publicToken: revokedToken } });
  await prisma.cateringQuoteEvent.create({
    data: {
      quoteId: quote.id,
      eventType: CateringQuoteAuditEventType.QUOTE_PUBLIC_LINK_REVOKED,
      performedBy: performedBy ?? null,
    },
  });
  return revokedToken;
}

/* ============================ follow-ups ============================ */

export async function createFollowUp(
  scope: Scope,
  quoteId: string,
  input: { title: string; description?: string | null; dueAt: Date; assignedToId?: string | null },
  performedBy?: string | null,
) {
  const quote = await prisma.cateringQuote.findFirst({ where: await cateringQuoteByIdWhereForOwner(scope.userId, quoteId) });
  if (!quote) throw new Error("Quote not found.");
  const followUp = await prisma.cateringQuoteFollowUp.create({
    data: {
      quoteId: quote.id,
      customerId: quote.customerId,
      title: input.title.trim(),
      description: input.description ?? null,
      dueAt: input.dueAt,
      assignedToId: input.assignedToId ?? null,
      createdBy: performedBy ?? null,
    },
  });
  await prisma.cateringQuoteEvent.create({
    data: {
      quoteId: quote.id,
      eventType: CateringQuoteAuditEventType.QUOTE_FOLLOW_UP_CREATED,
      performedBy: performedBy ?? null,
      metadataJson: { followUpId: followUp.id } as Prisma.InputJsonValue,
    },
  });
  return followUp;
}

export async function completeFollowUp(scope: Scope, followUpId: string, performedBy?: string | null) {
  const followUp = await prisma.cateringQuoteFollowUp.findFirst({
    where: {
      id: followUpId,
      quote: await cateringQuoteListWhereForOwner(scope.userId),
    },
  });
  if (!followUp) throw new Error("Follow-up not found.");
  const updated = await prisma.cateringQuoteFollowUp.update({
    where: { id: followUp.id },
    data: { status: "COMPLETED", completedAt: new Date() },
  });
  await prisma.cateringQuoteEvent.create({
    data: {
      quoteId: followUp.quoteId,
      eventType: CateringQuoteAuditEventType.QUOTE_FOLLOW_UP_COMPLETED,
      performedBy: performedBy ?? null,
      metadataJson: { followUpId: followUp.id } as Prisma.InputJsonValue,
    },
  });
  return updated;
}

/* ============================ KPIs ============================ */

export async function loadCateringQuoteKpis(userId: string) {
  const now = new Date();
  const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const inactiveStatuses = {
    notIn: [
      "CONVERTED_TO_ORDER",
      "REJECTED",
      "DECLINED",
      "CANCELLED",
      "ARCHIVED",
      "EXPIRED",
    ] satisfies CateringQuoteStatus[],
  };
  const [openWhere, draftWhere, sentWhere, acceptedWhere, expiringWhere, activeWhere, acceptedAggWhere, quoteScope] =
    await Promise.all([
      quoteOwnerWhere(userId, { status: inactiveStatuses }),
      quoteOwnerWhere(userId, { status: "DRAFT" }),
      quoteOwnerWhere(userId, { status: { in: ["SENT", "VIEWED", "READY_TO_SEND"] } }),
      quoteOwnerWhere(userId, { status: "ACCEPTED" }),
      quoteOwnerWhere(userId, {
        validUntil: { gte: now, lte: soon },
        status: { in: ["SENT", "VIEWED", "READY_TO_SEND", "NEEDS_REVISION"] },
      }),
      quoteOwnerWhere(userId, { status: inactiveStatuses }),
      quoteOwnerWhere(userId, { status: { in: ["ACCEPTED", "CONVERTED_TO_ORDER"] } }),
      cateringQuoteListWhereForOwner(userId),
    ]);

  const [open, draft, sent, accepted, expiringSoon, followUpsDue, allActive] = await Promise.all([
    prisma.cateringQuote.count({ where: openWhere }),
    prisma.cateringQuote.count({ where: draftWhere }),
    prisma.cateringQuote.count({ where: sentWhere }),
    prisma.cateringQuote.count({ where: acceptedWhere }),
    prisma.cateringQuote.count({ where: expiringWhere }),
    prisma.cateringQuoteFollowUp.count({
      where: { quote: quoteScope, status: "PENDING", dueAt: { lte: soon } },
    }),
    prisma.cateringQuote.findMany({
      where: activeWhere,
      select: { total: true, status: true },
    }),
  ]);

  const pipelineValueCents = allActive.reduce((acc, q) => acc + Math.round(decimalToNumber(q.total) * 100), 0);
  const acceptedAgg = await prisma.cateringQuote.aggregate({
    where: acceptedAggWhere,
    _sum: { total: true },
  });
  const acceptedRevenueValue = Math.round(decimalToNumber(acceptedAgg._sum.total ?? new Prisma.Decimal(0)) * 100);

  const avgValueCents = allActive.length > 0 ? Math.round(pipelineValueCents / allActive.length) : 0;

  return {
    open,
    draft,
    sent,
    accepted,
    expiringSoon,
    followUpsDue,
    pipelineValueCents,
    acceptedRevenueCents: acceptedRevenueValue,
    avgValueCents,
  };
}
