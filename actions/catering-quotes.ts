"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@prisma/client";

import {
  CATERING_EVENT_TYPE_VALUES,
  CATERING_LINE_TYPE_VALUES,
  CATERING_PRICING_MODE_VALUES,
  CATERING_SERVICE_STYLE_VALUES,
} from "@/lib/catering/quote-types";
import { CATERING_QUOTE_STATUS_VALUES } from "@/lib/catering/quote-status";
import { BUILT_IN_CATERING_TEMPLATES } from "@/lib/catering/quote-templates";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import {
  addQuoteLine,
  completeFollowUp,
  createFollowUp,
  createQuote,
  removeQuoteLine,
  revokePublicLink,
  rotatePublicLink,
  setQuoteStatus,
  snapshotQuoteVersion,
  updateQuoteFields,
} from "@/services/catering/quote-service";
import { convertQuoteToOrder } from "@/services/catering/quote-conversion-service";

const REVALIDATE_PATHS = [
  "/dashboard/catering-quotes",
  "/dashboard/catering-quotes/pipeline",
  "/dashboard/catering-quotes/follow-ups",
  "/dashboard/catering-quotes/templates",
  "/dashboard/catering-quotes/accepted",
  "/dashboard/catering-quotes/reports",
  "/dashboard/catering-quotes/public-proposals",
  "/dashboard/catering",
];

function revalidateAll(quoteId?: string) {
  for (const path of REVALIDATE_PATHS) revalidatePath(path);
  if (quoteId) revalidatePath(`/dashboard/catering-quotes/${quoteId}`);
}

function maybeDate(value: FormDataEntryValue | string | null | undefined): Date | null | undefined {
  if (value == null) return undefined;
  const v = String(value);
  if (v.trim() === "") return null;
  if (v.length < 8) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/* ============================ create ============================ */

const createSchema = z.object({
  customerName: z.string().min(1).max(255),
  customerEmail: z.string().email(),
  customerPhone: z.string().max(64).optional().or(z.literal("")),
  companyName: z.string().max(255).optional().or(z.literal("")),
  eventName: z.string().max(255).optional().or(z.literal("")),
  eventType: z.enum(CATERING_EVENT_TYPE_VALUES).optional(),
  serviceStyle: z.enum(CATERING_SERVICE_STYLE_VALUES).optional(),
  pricingMode: z.enum(CATERING_PRICING_MODE_VALUES).optional(),
  eventDate: z.string().optional(),
  guestCount: z.coerce.number().int().min(0).max(100000).optional(),
  brandId: z.string().uuid().optional().or(z.literal("")),
  locationId: z.string().uuid().optional().or(z.literal("")),
  deliveryRequired: z.string().optional().or(z.literal("")),
  setupRequired: z.string().optional().or(z.literal("")),
  staffingRequired: z.string().optional().or(z.literal("")),
  dietaryNotes: z.string().max(4000).optional().or(z.literal("")),
  allergyNotes: z.string().max(4000).optional().or(z.literal("")),
  internalNotes: z.string().max(4000).optional().or(z.literal("")),
  clientNotes: z.string().max(4000).optional().or(z.literal("")),
  notes: z.string().max(4000).optional().or(z.literal("")),
  validUntil: z.string().optional().or(z.literal("")),
  serviceFee: z.coerce.number().nonnegative().optional(),
  deliveryFee: z.coerce.number().nonnegative().optional(),
  setupFee: z.coerce.number().nonnegative().optional(),
  staffingFee: z.coerce.number().nonnegative().optional(),
  discount: z.coerce.number().nonnegative().optional(),
  tax: z.coerce.number().nonnegative().optional(),
  lineTitle: z.string().max(512).optional().or(z.literal("")),
  lineQty: z.coerce.number().int().min(1).optional(),
  lineUnitPrice: z.coerce.number().nonnegative().optional(),
});

export async function createCateringQuoteAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const parsed = createSchema.safeParse({
      customerName: formData.get("customerName"),
      customerEmail: formData.get("customerEmail"),
      customerPhone: formData.get("customerPhone"),
      companyName: formData.get("companyName"),
      eventName: formData.get("eventName"),
      eventType: formData.get("eventType") || undefined,
      serviceStyle: formData.get("serviceStyle") || undefined,
      pricingMode: formData.get("pricingMode") || undefined,
      eventDate: formData.get("eventDate"),
      guestCount: formData.get("guestCount"),
      brandId: formData.get("brandId"),
      locationId: formData.get("locationId"),
      deliveryRequired: formData.get("deliveryRequired"),
      setupRequired: formData.get("setupRequired"),
      staffingRequired: formData.get("staffingRequired"),
      dietaryNotes: formData.get("dietaryNotes"),
      allergyNotes: formData.get("allergyNotes"),
      internalNotes: formData.get("internalNotes"),
      clientNotes: formData.get("clientNotes"),
      notes: formData.get("notes"),
      validUntil: formData.get("validUntil"),
      serviceFee: formData.get("serviceFee") || undefined,
      deliveryFee: formData.get("deliveryFee") || undefined,
      setupFee: formData.get("setupFee") || undefined,
      staffingFee: formData.get("staffingFee") || undefined,
      discount: formData.get("discount") || undefined,
      tax: formData.get("tax") || undefined,
      lineTitle: formData.get("lineTitle"),
      lineQty: formData.get("lineQty") || undefined,
      lineUnitPrice: formData.get("lineUnitPrice") || undefined,
    });
    if (!parsed.success) return { error: "Check quote fields." };
    const d = parsed.data;

    const quote = await createQuote({
      userId: dataUserId,
      customerName: d.customerName,
      customerEmail: d.customerEmail,
      customerPhone: d.customerPhone || null,
      companyName: d.companyName || null,
      eventName: d.eventName || null,
      eventType: d.eventType,
      serviceStyle: d.serviceStyle,
      pricingMode: d.pricingMode,
      eventDate: maybeDate(d.eventDate) ?? null,
      guestCount: d.guestCount ?? null,
      brandId: d.brandId || null,
      locationId: d.locationId || null,
      deliveryRequired: d.deliveryRequired === "on",
      setupRequired: d.setupRequired === "on",
      staffingRequired: d.staffingRequired === "on",
      dietaryNotes: d.dietaryNotes || null,
      allergyNotes: d.allergyNotes || null,
      internalNotes: d.internalNotes || null,
      clientNotes: d.clientNotes || null,
      notes: d.notes || null,
      validUntil: maybeDate(d.validUntil) ?? null,
      serviceFee: d.serviceFee,
      deliveryFee: d.deliveryFee,
      setupFee: d.setupFee,
      staffingFee: d.staffingFee,
      discount: d.discount,
      tax: d.tax,
      starterLine:
        d.lineTitle
          ? {
              title: d.lineTitle,
              quantity: d.lineQty ?? 1,
              unitPrice: d.lineUnitPrice ?? 0,
              lineType: "FOOD",
            }
          : null,
      performedBy: user.email ?? null,
    });
    revalidateAll(quote.id);
    return { ok: true as const, quoteId: quote.id };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createCateringQuoteFormAction(formData: FormData): Promise<void> {
  const result = await createCateringQuoteAction(formData);
  if ("ok" in result && result.ok && result.quoteId) {
    redirect(`/dashboard/catering-quotes/${result.quoteId}`);
  }
}

/* ============================ update ============================ */

const updateSchema = z.object({
  quoteId: z.string().uuid(),
  customerName: z.string().min(1).max(255).optional(),
  customerEmail: z.string().email().optional(),
  customerPhone: z.string().max(64).optional().or(z.literal("")),
  companyName: z.string().max(255).optional().or(z.literal("")),
  eventName: z.string().max(255).optional().or(z.literal("")),
  eventType: z.enum(CATERING_EVENT_TYPE_VALUES).optional(),
  serviceStyle: z.enum(CATERING_SERVICE_STYLE_VALUES).optional(),
  pricingMode: z.enum(CATERING_PRICING_MODE_VALUES).optional(),
  eventDate: z.string().optional().or(z.literal("")),
  guestCount: z.coerce.number().int().min(0).max(100000).optional(),
  brandId: z.string().uuid().optional().or(z.literal("")),
  locationId: z.string().uuid().optional().or(z.literal("")),
  deliveryRequired: z.string().optional().or(z.literal("")),
  setupRequired: z.string().optional().or(z.literal("")),
  staffingRequired: z.string().optional().or(z.literal("")),
  dietaryNotes: z.string().max(4000).optional().or(z.literal("")),
  allergyNotes: z.string().max(4000).optional().or(z.literal("")),
  internalNotes: z.string().max(4000).optional().or(z.literal("")),
  clientNotes: z.string().max(4000).optional().or(z.literal("")),
  notes: z.string().max(4000).optional().or(z.literal("")),
  validUntil: z.string().optional().or(z.literal("")),
  serviceFee: z.coerce.number().nonnegative().optional(),
  deliveryFee: z.coerce.number().nonnegative().optional(),
  setupFee: z.coerce.number().nonnegative().optional(),
  staffingFee: z.coerce.number().nonnegative().optional(),
  discount: z.coerce.number().nonnegative().optional(),
  tax: z.coerce.number().nonnegative().optional(),
});

export async function updateCateringQuoteAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const parsed = updateSchema.safeParse({
      quoteId: formData.get("quoteId"),
      customerName: formData.get("customerName") || undefined,
      customerEmail: formData.get("customerEmail") || undefined,
      customerPhone: formData.get("customerPhone"),
      companyName: formData.get("companyName"),
      eventName: formData.get("eventName"),
      eventType: formData.get("eventType") || undefined,
      serviceStyle: formData.get("serviceStyle") || undefined,
      pricingMode: formData.get("pricingMode") || undefined,
      eventDate: formData.get("eventDate"),
      guestCount: formData.get("guestCount") || undefined,
      brandId: formData.get("brandId"),
      locationId: formData.get("locationId"),
      deliveryRequired: formData.get("deliveryRequired"),
      setupRequired: formData.get("setupRequired"),
      staffingRequired: formData.get("staffingRequired"),
      dietaryNotes: formData.get("dietaryNotes"),
      allergyNotes: formData.get("allergyNotes"),
      internalNotes: formData.get("internalNotes"),
      clientNotes: formData.get("clientNotes"),
      notes: formData.get("notes"),
      validUntil: formData.get("validUntil"),
      serviceFee: formData.get("serviceFee") || undefined,
      deliveryFee: formData.get("deliveryFee") || undefined,
      setupFee: formData.get("setupFee") || undefined,
      staffingFee: formData.get("staffingFee") || undefined,
      discount: formData.get("discount") || undefined,
      tax: formData.get("tax") || undefined,
    });
    if (!parsed.success) return { error: "Check fields." };
    const d = parsed.data;
    await updateQuoteFields(
      { userId: dataUserId },
      d.quoteId,
      {
        customerName: d.customerName,
        customerEmail: d.customerEmail,
        customerPhone: d.customerPhone ?? undefined,
        companyName: d.companyName ?? undefined,
        eventName: d.eventName ?? undefined,
        eventType: d.eventType,
        serviceStyle: d.serviceStyle,
        pricingMode: d.pricingMode,
        eventDate: d.eventDate !== undefined ? maybeDate(d.eventDate) ?? null : undefined,
        guestCount: d.guestCount,
        brandId: d.brandId ?? undefined,
        locationId: d.locationId ?? undefined,
        deliveryRequired: d.deliveryRequired === "on" || d.deliveryRequired === "true",
        setupRequired: d.setupRequired === "on" || d.setupRequired === "true",
        staffingRequired: d.staffingRequired === "on" || d.staffingRequired === "true",
        dietaryNotes: d.dietaryNotes ?? undefined,
        allergyNotes: d.allergyNotes ?? undefined,
        internalNotes: d.internalNotes ?? undefined,
        clientNotes: d.clientNotes ?? undefined,
        notes: d.notes ?? undefined,
        validUntil: d.validUntil !== undefined ? maybeDate(d.validUntil) ?? null : undefined,
        serviceFee: d.serviceFee,
        deliveryFee: d.deliveryFee,
        setupFee: d.setupFee,
        staffingFee: d.staffingFee,
        discount: d.discount,
        tax: d.tax,
      },
      user.email ?? null,
    );
    revalidateAll(d.quoteId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateCateringQuoteFormAction(formData: FormData): Promise<void> {
  void (await updateCateringQuoteAction(formData));
}

/* ============================ status ============================ */

const statusSchema = z.object({
  quoteId: z.string().uuid(),
  status: z.enum(CATERING_QUOTE_STATUS_VALUES),
});

export async function setCateringQuoteStatusAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const parsed = statusSchema.safeParse({
      quoteId: formData.get("quoteId"),
      status: formData.get("status"),
    });
    if (!parsed.success) return { error: "Invalid status payload." };
    await setQuoteStatus({ userId: dataUserId }, parsed.data.quoteId, parsed.data.status, user.email ?? null);
    revalidateAll(parsed.data.quoteId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function setCateringQuoteStatusFormAction(formData: FormData): Promise<void> {
  void (await setCateringQuoteStatusAction(formData));
}

/* ============================ lines ============================ */

const addLineSchema = z.object({
  quoteId: z.string().uuid(),
  title: z.string().min(1).max(512),
  description: z.string().max(4000).optional().or(z.literal("")),
  lineType: z.enum(CATERING_LINE_TYPE_VALUES).optional(),
  productId: z.string().uuid().optional().or(z.literal("")),
  menuId: z.string().uuid().optional().or(z.literal("")),
  quantity: z.coerce.number().int().min(1).max(99999).optional(),
  unit: z.string().max(40).optional().or(z.literal("")),
  unitPrice: z.coerce.number().nonnegative(),
  costEstimate: z.coerce.number().nonnegative().optional(),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export async function addCateringQuoteLineAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const parsed = addLineSchema.safeParse({
      quoteId: formData.get("quoteId"),
      title: formData.get("title"),
      description: formData.get("description"),
      lineType: formData.get("lineType") || undefined,
      productId: formData.get("productId"),
      menuId: formData.get("menuId"),
      quantity: formData.get("quantity") || undefined,
      unit: formData.get("unit"),
      unitPrice: formData.get("unitPrice"),
      costEstimate: formData.get("costEstimate") || undefined,
      notes: formData.get("notes"),
    });
    if (!parsed.success) return { error: "Check line fields." };
    const d = parsed.data;
    await addQuoteLine(
      { userId: dataUserId },
      d.quoteId,
      {
        title: d.title,
        description: d.description || null,
        lineType: d.lineType,
        productId: d.productId || null,
        menuId: d.menuId || null,
        quantity: d.quantity ?? 1,
        unit: d.unit || null,
        unitPrice: d.unitPrice,
        costEstimate: d.costEstimate ?? null,
        notes: d.notes || null,
      },
      user.email ?? null,
    );
    revalidateAll(d.quoteId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function addCateringQuoteLineFormAction(formData: FormData): Promise<void> {
  void (await addCateringQuoteLineAction(formData));
}

export async function removeCateringQuoteLineAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const lineId = String(formData.get("lineId") ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(lineId)) return { error: "Invalid line id." };
    const item = await prisma.cateringQuoteItem.findFirst({
      where: { id: lineId, quote: { userId: dataUserId } },
      select: { quoteId: true },
    });
    if (!item) return { error: "Line not found." };
    await removeQuoteLine({ userId: dataUserId }, lineId, user.email ?? null);
    revalidateAll(item.quoteId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function removeCateringQuoteLineFormAction(formData: FormData): Promise<void> {
  void (await removeCateringQuoteLineAction(formData));
}

/* ============================ versions ============================ */

export async function snapshotCateringQuoteVersionAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const quoteId = String(formData.get("quoteId") ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(quoteId)) return { error: "Invalid quote id." };
    const reason = (formData.get("reason") ?? null) as string | null;
    const versionNumber = await snapshotQuoteVersion({ userId: dataUserId }, quoteId, user.email ?? null, reason);
    revalidateAll(quoteId);
    return { ok: true as const, versionNumber };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function snapshotCateringQuoteVersionFormAction(formData: FormData): Promise<void> {
  void (await snapshotCateringQuoteVersionAction(formData));
}

/* ============================ public link ============================ */

export async function rotateCateringPublicLinkAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const quoteId = String(formData.get("quoteId") ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(quoteId)) return { error: "Invalid quote id." };
    const token = await rotatePublicLink({ userId: dataUserId }, quoteId, user.email ?? null);
    revalidateAll(quoteId);
    return { ok: true as const, token };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function rotateCateringPublicLinkFormAction(formData: FormData): Promise<void> {
  void (await rotateCateringPublicLinkAction(formData));
}

export async function revokeCateringPublicLinkAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const quoteId = String(formData.get("quoteId") ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(quoteId)) return { error: "Invalid quote id." };
    await revokePublicLink({ userId: dataUserId }, quoteId, user.email ?? null);
    revalidateAll(quoteId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function revokeCateringPublicLinkFormAction(formData: FormData): Promise<void> {
  void (await revokeCateringPublicLinkAction(formData));
}

/* ============================ follow-ups ============================ */

const followUpSchema = z.object({
  quoteId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().max(4000).optional().or(z.literal("")),
  dueAt: z.string().min(8),
});

export async function createCateringFollowUpAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const parsed = followUpSchema.safeParse({
      quoteId: formData.get("quoteId"),
      title: formData.get("title"),
      description: formData.get("description"),
      dueAt: formData.get("dueAt"),
    });
    if (!parsed.success) return { error: "Check follow-up fields." };
    const d = parsed.data;
    await createFollowUp(
      { userId: dataUserId },
      d.quoteId,
      { title: d.title, description: d.description || null, dueAt: new Date(d.dueAt) },
      user.email ?? null,
    );
    revalidateAll(d.quoteId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createCateringFollowUpFormAction(formData: FormData): Promise<void> {
  void (await createCateringFollowUpAction(formData));
}

export async function completeCateringFollowUpAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const followUpId = String(formData.get("followUpId") ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(followUpId)) return { error: "Invalid follow-up id." };
    const fu = await prisma.cateringQuoteFollowUp.findFirst({
      where: { id: followUpId, quote: { userId: dataUserId } },
      select: { quoteId: true },
    });
    if (!fu) return { error: "Follow-up not found." };
    await completeFollowUp({ userId: dataUserId }, followUpId, user.email ?? null);
    revalidateAll(fu.quoteId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function completeCateringFollowUpFormAction(formData: FormData): Promise<void> {
  void (await completeCateringFollowUpAction(formData));
}

/* ============================ conversion ============================ */

export async function convertCateringQuoteAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const quoteId = String(formData.get("quoteId") ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(quoteId)) return { error: "Invalid quote id." };
    const depositPercent = Number(String(formData.get("depositPercent") ?? "0"));
    const r = await convertQuoteToOrder({ userId: dataUserId }, quoteId, user.email ?? null, depositPercent);
    revalidateAll(quoteId);
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/order-hub");
    revalidatePath("/dashboard/customers");
    if (!r.ok) return { error: r.error };
    return { ok: true as const, orderId: r.orderId, depositUrl: r.depositUrl ?? null };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function convertCateringQuoteFormAction(formData: FormData): Promise<void> {
  void (await convertCateringQuoteAction(formData));
}

/* ============================ templates ============================ */

const templateSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(4000).optional().or(z.literal("")),
  builtInKey: z.string().max(80).optional().or(z.literal("")),
});

export async function createCateringTemplateAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const parsed = templateSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
      builtInKey: formData.get("builtInKey"),
    });
    if (!parsed.success) return { error: "Name is required." };

    const built = parsed.data.builtInKey
      ? BUILT_IN_CATERING_TEMPLATES.find((t) => t.key === parsed.data.builtInKey)
      : null;

    await prisma.cateringQuoteTemplate.create({
      data: {
        userId: dataUserId,
        name: parsed.data.name,
        description: parsed.data.description || built?.description || null,
        eventType: built?.eventType ?? "CUSTOM",
        serviceStyle: built?.serviceStyle ?? "DROP_OFF",
        pricingMode: built?.pricingMode ?? "FIXED",
        defaultLinesJson:
          (built && built.defaultLines.length > 0
            ? (built.defaultLines as unknown as Prisma.InputJsonValue)
            : Prisma.JsonNull) as Prisma.InputJsonValue,
        defaultFeesJson:
          (built
            ? (built.defaultFees as unknown as Prisma.InputJsonValue)
            : Prisma.JsonNull) as Prisma.InputJsonValue,
        clientCopy: built?.clientCopy ?? null,
        internalChecklist: built?.internalChecklist ?? null,
        builtInKey: parsed.data.builtInKey || null,
      },
    });
    revalidateAll();
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createCateringTemplateFormAction(formData: FormData): Promise<void> {
  void (await createCateringTemplateAction(formData));
}
