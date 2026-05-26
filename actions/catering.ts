"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { createQuote } from "@/services/catering/quote-service";

const createSchema = z.object({
  customerName: z.string().min(1).max(255),
  customerEmail: z.string().email(),
  companyName: z.string().max(255).optional().or(z.literal("")),
  eventDate: z.string().optional(),
  guestCount: z.coerce.number().int().min(0).optional(),
  notes: z.string().max(4000).optional().or(z.literal("")),
  lineTitle: z.string().max(512).optional().or(z.literal("")),
  lineQty: z.coerce.number().int().min(1).optional(),
  lineUnitPrice: z.coerce.number().min(0).optional(),
});

export async function createCateringQuoteAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const parsed = createSchema.safeParse({
      customerName: formData.get("customerName"),
      customerEmail: formData.get("customerEmail"),
      companyName: formData.get("companyName"),
      eventDate: formData.get("eventDate")?.toString(),
      guestCount: formData.get("guestCount"),
      notes: formData.get("notes"),
      lineTitle: formData.get("lineTitle"),
      lineQty: formData.get("lineQty"),
      lineUnitPrice: formData.get("lineUnitPrice"),
    });
    if (!parsed.success) return { error: "Check quote fields and try again." };
    const d = parsed.data;

    const eventDate =
      d.eventDate && d.eventDate.length >= 8 ? new Date(d.eventDate) : null;

    const lineTitle = d.lineTitle?.trim();
    const qty = d.lineQty ?? 1;
    const unit = d.lineUnitPrice ?? 0;
    const hasLine = Boolean(lineTitle) && unit >= 0;

    // Use the new Command Center service so legacy creates show up in the
    // new pipeline, the customer is upserted in CRM, audit events are
    // recorded, and quoteNumber is generated.
    const quote = await createQuote({
      userId: dataUserId,
      customerName: d.customerName,
      customerEmail: d.customerEmail,
      companyName: d.companyName || null,
      eventDate,
      guestCount: d.guestCount ?? null,
      notes: d.notes || null,
      starterLine: hasLine && lineTitle
        ? { title: lineTitle, quantity: qty, unitPrice: unit, lineType: "FOOD" }
        : null,
      performedBy: user.email ?? null,
    });

    revalidatePath("/dashboard/catering");
    revalidatePath("/dashboard/catering-quotes");
    return { ok: true as const, quoteId: quote.id, publicToken: quote.publicToken };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function markQuoteSentAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const id = String(formData.get("quoteId") ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Invalid quote." };
    await prisma.cateringQuote.updateMany({
      where: { id, userId: dataUserId },
      data: { status: "SENT" },
    });
    revalidatePath("/dashboard/catering");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createCateringQuoteFormAction(formData: FormData): Promise<void> {
  void (await createCateringQuoteAction(formData));
}

export async function markQuoteSentFormAction(formData: FormData): Promise<void> {
  void (await markQuoteSentAction(formData));
}
