"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireCrmMutation } from "@/lib/crm/require-crm-mutation";
import { CUSTOMER_SOURCE_VALUES, CUSTOMER_TYPE_VALUES } from "@/lib/crm/customer-types";
import { CUSTOMER_STATUS_VALUES } from "@/lib/crm/customer-status";
import { BUILT_IN_SEGMENTS, evaluateSegment, type SegmentRule } from "@/lib/crm/customer-segments";
import {
  parseAllergies,
  parseDietaryPreferences,
  parseTags,
} from "@/lib/crm/customer-privacy";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import {
  archiveCustomer,
  upsertCustomerByEmail,
} from "@/services/crm/customer-service";
import { recomputeAllCustomerMetrics } from "@/services/crm/customer-metrics-service";
import {
  CustomerConsentType,
  CustomerFollowUpStatus,
  CustomerFollowUpType,
  CustomerNoteVisibility,
  Prisma,
} from "@prisma/client";

const REVALIDATE_PATHS = [
  "/dashboard/customers",
  "/dashboard/customers/segments",
  "/dashboard/customers/follow-ups",
  "/dashboard/customers/companies",
  "/dashboard/customers/deduplication",
  "/dashboard/customers/dedupe",
  "/dashboard/customers/reports",
];

function revalidateAll(customerId?: string) {
  for (const p of REVALIDATE_PATHS) revalidatePath(p);
  if (customerId) revalidatePath(`/dashboard/customers/${customerId}`);
}

function splitCsv(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(/[,\n;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/* ============================ create / update ============================ */

const createCustomerSchema = z.object({
  email: z.string().email(),
  firstName: z.string().max(120).optional().or(z.literal("")),
  lastName: z.string().max(120).optional().or(z.literal("")),
  displayName: z.string().max(255).optional().or(z.literal("")),
  phone: z.string().max(64).optional().or(z.literal("")),
  companyName: z.string().max(255).optional().or(z.literal("")),
  type: z.enum(CUSTOMER_TYPE_VALUES).optional(),
  status: z.enum(CUSTOMER_STATUS_VALUES).optional(),
  source: z.enum(CUSTOMER_SOURCE_VALUES).optional(),
  tags: z.string().optional().or(z.literal("")),
  notes: z.string().max(4000).optional().or(z.literal("")),
});

export async function createCustomerAction(formData: FormData) {
  try {
    const access = await requireCrmMutation();
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, dataUserId } = access.actor;
    const parsed = createCustomerSchema.safeParse({
      email: formData.get("email"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      displayName: formData.get("displayName"),
      phone: formData.get("phone"),
      companyName: formData.get("companyName"),
      type: formData.get("type") || undefined,
      status: formData.get("status") || undefined,
      source: formData.get("source") || undefined,
      tags: formData.get("tags"),
      notes: formData.get("notes"),
    });
    if (!parsed.success) return { error: "Valid email is required." };
    const d = parsed.data;
    const customer = await upsertCustomerByEmail({
      userId: dataUserId,
      email: d.email,
      name: d.displayName?.trim() || [d.firstName, d.lastName].filter(Boolean).join(" ").trim() || null,
      phone: d.phone || null,
      companyName: d.companyName || null,
      source: d.source ?? "MANUAL",
      type: d.type ?? "INDIVIDUAL",
      status: d.status ?? "NEW",
    });

    const tags = splitCsv(d.tags);
    const updates: Prisma.KitchenCustomerUpdateInput = {};
    if (d.firstName) updates.firstName = d.firstName;
    if (d.lastName) updates.lastName = d.lastName;
    if (d.displayName) updates.displayName = d.displayName;
    if (d.notes) updates.notes = d.notes;
    if (tags.length > 0) updates.tagsJson = tags as Prisma.InputJsonValue;
    if (Object.keys(updates).length > 0) {
      await prisma.kitchenCustomer.update({ where: { id: customer.id }, data: updates });
    }
    revalidateAll(customer.id);
    return { ok: true as const, customerId: customer.id };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createCustomerFormAction(formData: FormData): Promise<void> {
  const r = await createCustomerAction(formData);
  if ("ok" in r && r.ok && r.customerId) {
    redirect(`/dashboard/customers/${r.customerId}`);
  }
}

const profileSchema = z.object({
  customerId: z.string().uuid(),
  firstName: z.string().max(120).optional().or(z.literal("")),
  lastName: z.string().max(120).optional().or(z.literal("")),
  displayName: z.string().max(255).optional().or(z.literal("")),
  phone: z.string().max(64).optional().or(z.literal("")),
  companyName: z.string().max(255).optional().or(z.literal("")),
  jobTitle: z.string().max(120).optional().or(z.literal("")),
  type: z.enum(CUSTOMER_TYPE_VALUES).optional(),
  status: z.enum(CUSTOMER_STATUS_VALUES).optional(),
  notes: z.string().max(4000).optional().or(z.literal("")),
  deliveryNotes: z.string().max(2000).optional().or(z.literal("")),
});

export async function updateCustomerProfileAction(formData: FormData) {
  try {
    const access = await requireCrmMutation();
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, dataUserId } = access.actor;
    const parsed = profileSchema.safeParse({
      customerId: formData.get("customerId"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      displayName: formData.get("displayName"),
      phone: formData.get("phone"),
      companyName: formData.get("companyName"),
      jobTitle: formData.get("jobTitle"),
      type: formData.get("type") || undefined,
      status: formData.get("status") || undefined,
      notes: formData.get("notes"),
      deliveryNotes: formData.get("deliveryNotes"),
    });
    if (!parsed.success) return { error: "Check customer fields." };
    const d = parsed.data;
    const existing = await prisma.kitchenCustomer.findFirst({
      where: { id: d.customerId, userId: dataUserId },
    });
    if (!existing) return { error: "Customer not found." };

    await prisma.kitchenCustomer.update({
      where: { id: existing.id },
      data: {
        firstName: d.firstName || null,
        lastName: d.lastName || null,
        displayName: d.displayName || null,
        phone: d.phone || null,
        companyName: d.companyName || null,
        jobTitle: d.jobTitle || null,
        type: d.type ?? existing.type,
        status: d.status ?? existing.status,
        notes: d.notes ?? existing.notes,
        deliveryNotes: d.deliveryNotes ?? existing.deliveryNotes,
        name:
          d.displayName?.trim() ||
          [d.firstName, d.lastName].filter(Boolean).join(" ").trim() ||
          existing.name,
      },
    });
    await prisma.customerTimelineEvent.create({
      data: { customerId: existing.id, eventType: "CUSTOMER_UPDATED", summary: "Profile updated" },
    });
    revalidateAll(existing.id);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateCustomerProfileFormAction(formData: FormData): Promise<void> {
  void (await updateCustomerProfileAction(formData));
}

/* ============================ allergies / dietary ============================ */

const allergyDietarySchema = z.object({
  customerId: z.string().uuid(),
  allergies: z.string().optional().or(z.literal("")),
  dietary: z.string().optional().or(z.literal("")),
  dislikes: z.string().optional().or(z.literal("")),
  favorites: z.string().optional().or(z.literal("")),
});

export async function updateCustomerDietaryAction(formData: FormData) {
  try {
    const access = await requireCrmMutation();
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, dataUserId } = access.actor;
    const parsed = allergyDietarySchema.safeParse({
      customerId: formData.get("customerId"),
      allergies: formData.get("allergies"),
      dietary: formData.get("dietary"),
      dislikes: formData.get("dislikes"),
      favorites: formData.get("favorites"),
    });
    if (!parsed.success) return { error: "Invalid input." };
    const d = parsed.data;
    const existing = await prisma.kitchenCustomer.findFirst({
      where: { id: d.customerId, userId: dataUserId },
    });
    if (!existing) return { error: "Customer not found." };

    const allergies = splitCsv(d.allergies);
    const dietary = splitCsv(d.dietary);
    const dislikes = splitCsv(d.dislikes);
    const favorites = splitCsv(d.favorites);

    await prisma.kitchenCustomer.update({
      where: { id: existing.id },
      data: {
        allergiesJson: (allergies.length ? allergies : Prisma.JsonNull) as Prisma.InputJsonValue,
        dietaryPreferencesJson: (dietary.length ? dietary : Prisma.JsonNull) as Prisma.InputJsonValue,
        dislikesJson: (dislikes.length ? dislikes : Prisma.JsonNull) as Prisma.InputJsonValue,
        favoriteItemsJson: (favorites.length ? favorites : Prisma.JsonNull) as Prisma.InputJsonValue,
      },
    });
    await prisma.customerTimelineEvent.create({
      data: {
        customerId: existing.id,
        eventType: "ALLERGY_CONFIRMED",
        summary: `Allergies: ${allergies.length}, dietary: ${dietary.length}`,
      },
    });
    revalidateAll(existing.id);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateCustomerDietaryFormAction(formData: FormData): Promise<void> {
  void (await updateCustomerDietaryAction(formData));
}

/* ============================ notes ============================ */

const noteSchema = z.object({
  customerId: z.string().uuid(),
  note: z.string().min(1).max(4000),
  visibility: z.nativeEnum(CustomerNoteVisibility).optional(),
});

export async function createCustomerNoteAction(formData: FormData) {
  try {
    const access = await requireCrmMutation();
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, dataUserId } = access.actor;
    const parsed = noteSchema.safeParse({
      customerId: formData.get("customerId"),
      note: formData.get("note"),
      visibility: (formData.get("visibility") as CustomerNoteVisibility | null) ?? "INTERNAL",
    });
    if (!parsed.success) return { error: "Note is required." };
    const existing = await prisma.kitchenCustomer.findFirst({
      where: { id: parsed.data.customerId, userId: dataUserId },
      select: { id: true },
    });
    if (!existing) return { error: "Customer not found." };

    await prisma.customerNote.create({
      data: {
        customerId: existing.id,
        authorId: user.id,
        note: parsed.data.note,
        visibility: parsed.data.visibility ?? "INTERNAL",
      },
    });
    await prisma.customerTimelineEvent.create({
      data: { customerId: existing.id, eventType: "NOTE_ADDED", summary: "Note added" },
    });
    revalidateAll(existing.id);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createCustomerNoteFormAction(formData: FormData): Promise<void> {
  void (await createCustomerNoteAction(formData));
}

/* ============================ follow-ups ============================ */

const followUpSchema = z.object({
  customerId: z.string().uuid(),
  title: z.string().min(1).max(255),
  type: z.nativeEnum(CustomerFollowUpType).optional(),
  dueAt: z.string().optional().or(z.literal("")),
  reason: z.string().max(4000).optional().or(z.literal("")),
});

export async function createCustomerFollowUpAction(formData: FormData) {
  try {
    const access = await requireCrmMutation();
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, dataUserId } = access.actor;
    const parsed = followUpSchema.safeParse({
      customerId: formData.get("customerId"),
      title: formData.get("title"),
      type: (formData.get("type") as CustomerFollowUpType | null) ?? "GENERAL",
      dueAt: formData.get("dueAt"),
      reason: formData.get("reason"),
    });
    if (!parsed.success) return { error: "Title is required." };
    const existing = await prisma.kitchenCustomer.findFirst({
      where: { id: parsed.data.customerId, userId: dataUserId },
      select: { id: true },
    });
    if (!existing) return { error: "Customer not found." };

    const followUp = await prisma.customerFollowUp.create({
      data: {
        userId: dataUserId,
        customerId: existing.id,
        title: parsed.data.title,
        type: parsed.data.type ?? "GENERAL",
        reason: parsed.data.reason || null,
        dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
      },
    });
    await prisma.kitchenCustomer.update({
      where: { id: existing.id },
      data: { nextFollowUpAt: followUp.dueAt ?? followUp.createdAt },
    });
    await prisma.customerTimelineEvent.create({
      data: {
        customerId: existing.id,
        eventType: "FOLLOW_UP_CREATED",
        summary: parsed.data.title,
        sourceType: "follow_up",
        sourceId: followUp.id,
      },
    });
    revalidateAll(existing.id);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createCustomerFollowUpFormAction(formData: FormData): Promise<void> {
  void (await createCustomerFollowUpAction(formData));
}

const followUpCompleteSchema = z.object({
  followUpId: z.string().uuid(),
  status: z.nativeEnum(CustomerFollowUpStatus).optional(),
});

export async function updateCustomerFollowUpStatusAction(formData: FormData) {
  try {
    const access = await requireCrmMutation();
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, dataUserId } = access.actor;
    const parsed = followUpCompleteSchema.safeParse({
      followUpId: formData.get("followUpId"),
      status: (formData.get("status") as CustomerFollowUpStatus | null) ?? "COMPLETED",
    });
    if (!parsed.success) return { error: "Invalid follow-up id." };
    const existing = await prisma.customerFollowUp.findFirst({
      where: { id: parsed.data.followUpId, userId: dataUserId },
    });
    if (!existing) return { error: "Follow-up not found." };

    const next = parsed.data.status ?? "COMPLETED";
    await prisma.customerFollowUp.update({
      where: { id: existing.id },
      data: {
        status: next,
        completedAt: next === "COMPLETED" ? new Date() : existing.completedAt,
      },
    });
    if (next === "COMPLETED") {
      await prisma.customerTimelineEvent.create({
        data: {
          customerId: existing.customerId,
          eventType: "FOLLOW_UP_COMPLETED",
          summary: existing.title,
          sourceType: "follow_up",
          sourceId: existing.id,
        },
      });
    }
    revalidateAll(existing.customerId);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateCustomerFollowUpStatusFormAction(formData: FormData): Promise<void> {
  void (await updateCustomerFollowUpStatusAction(formData));
}

/* ============================ consent ============================ */

const consentSchema = z.object({
  customerId: z.string().uuid(),
  consentType: z.nativeEnum(CustomerConsentType),
  value: z.enum(["on", "off"]),
  source: z.string().max(120).optional().or(z.literal("")),
});

export async function updateCustomerConsentAction(formData: FormData) {
  try {
    const access = await requireCrmMutation();
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, dataUserId } = access.actor;
    const parsed = consentSchema.safeParse({
      customerId: formData.get("customerId"),
      consentType: formData.get("consentType"),
      value: formData.get("value"),
      source: formData.get("source"),
    });
    if (!parsed.success) return { error: "Invalid consent payload." };
    const existing = await prisma.kitchenCustomer.findFirst({
      where: { id: parsed.data.customerId, userId: dataUserId },
      select: { id: true, marketingConsent: true, smsConsent: true },
    });
    if (!existing) return { error: "Customer not found." };

    const truthy = parsed.data.value === "on";
    const updateData: Prisma.KitchenCustomerUpdateInput = { consentSource: parsed.data.source || null, consentAt: new Date() };
    if (parsed.data.consentType === "EMAIL_MARKETING") updateData.marketingConsent = truthy;
    if (parsed.data.consentType === "SMS_MARKETING") updateData.smsConsent = truthy;

    await prisma.kitchenCustomer.update({ where: { id: existing.id }, data: updateData });
    await prisma.customerConsentEvent.create({
      data: {
        customerId: existing.id,
        consentType: parsed.data.consentType,
        value: truthy,
        source: parsed.data.source || null,
        performedBy: user.email ?? null,
      },
    });
    await prisma.customerTimelineEvent.create({
      data: {
        customerId: existing.id,
        eventType: "CONSENT_CHANGED",
        summary: `${parsed.data.consentType} → ${truthy ? "granted" : "revoked"}`,
      },
    });
    revalidateAll(existing.id);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function updateCustomerConsentFormAction(formData: FormData): Promise<void> {
  void (await updateCustomerConsentAction(formData));
}

/* ============================ segments ============================ */

const segmentSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional().or(z.literal("")),
  builtInKey: z.string().max(80).optional().or(z.literal("")),
  rulesJson: z.string().optional().or(z.literal("")),
});

export async function createCustomerSegmentAction(formData: FormData) {
  try {
    const access = await requireCrmMutation();
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, dataUserId } = access.actor;
    const parsed = segmentSchema.safeParse({
      name: formData.get("name"),
      description: formData.get("description"),
      builtInKey: formData.get("builtInKey"),
      rulesJson: formData.get("rulesJson"),
    });
    if (!parsed.success) return { error: "Segment name is required." };

    let rules: SegmentRule[] = [];
    if (parsed.data.builtInKey) {
      const built = BUILT_IN_SEGMENTS.find((b) => b.key === parsed.data.builtInKey);
      if (built) rules = [...built.rules];
    }
    if (parsed.data.rulesJson) {
      try {
        const decoded = JSON.parse(parsed.data.rulesJson);
        if (Array.isArray(decoded)) rules = decoded as SegmentRule[];
      } catch {
        return { error: "Rules JSON is invalid." };
      }
    }

    const segment = await prisma.customerSegment.create({
      data: {
        userId: dataUserId,
        name: parsed.data.name,
        description: parsed.data.description || null,
        builtInKey: parsed.data.builtInKey || null,
        rulesJson: { rules } as Prisma.InputJsonValue,
        color: BUILT_IN_SEGMENTS.find((b) => b.key === parsed.data.builtInKey)?.color ?? null,
      },
    });

    await rebuildSegmentMemberships(dataUserId, segment.id);
    revalidateAll();
    return { ok: true as const, segmentId: segment.id };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createCustomerSegmentFormAction(formData: FormData): Promise<void> {
  void (await createCustomerSegmentAction(formData));
}

export async function rebuildSegmentMembershipsAction(formData: FormData) {
  try {
    const access = await requireCrmMutation();
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, dataUserId } = access.actor;
    const segmentId = String(formData.get("segmentId") ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(segmentId)) return { error: "Invalid segment id." };
    const r = await rebuildSegmentMemberships(dataUserId, segmentId);
    revalidateAll();
    return { ok: true as const, ...r };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function rebuildSegmentMembershipsFormAction(formData: FormData): Promise<void> {
  void (await rebuildSegmentMembershipsAction(formData));
}

async function rebuildSegmentMemberships(userId: string, segmentId: string): Promise<{ added: number; removed: number }> {
  const segment = await prisma.customerSegment.findFirst({ where: { id: segmentId, userId } });
  if (!segment) return { added: 0, removed: 0 };
  const rules: SegmentRule[] = Array.isArray((segment.rulesJson as { rules?: unknown })?.rules)
    ? ((segment.rulesJson as { rules: SegmentRule[] }).rules ?? [])
    : [];
  const customers = await prisma.kitchenCustomer.findMany({
    where: { userId },
    select: {
      id: true,
      status: true,
      type: true,
      source: true,
      lifetimeValueCents: true,
      totalOrders: true,
      lastOrderAt: true,
      marketingConsent: true,
      allergiesJson: true,
      dietaryPreferencesJson: true,
      tagsJson: true,
    },
  });
  const now = new Date();

  await prisma.customerSegmentMembership.deleteMany({ where: { segmentId } });
  let added = 0;
  for (const c of customers) {
    const matches = evaluateSegment(rules, {
      status: c.status,
      type: c.type,
      source: c.source,
      lifetimeValueCents: c.lifetimeValueCents,
      totalOrders: c.totalOrders,
      lastOrderAt: c.lastOrderAt,
      marketingConsent: c.marketingConsent,
      allergies: parseAllergies(c.allergiesJson),
      dietary: parseDietaryPreferences(c.dietaryPreferencesJson),
      tags: parseTags(c.tagsJson),
    }, now);
    if (matches) {
      await prisma.customerSegmentMembership.create({ data: { segmentId, customerId: c.id } });
      added += 1;
    }
  }
  return { added, removed: 0 };
}

/* ============================ company accounts ============================ */

const companySchema = z.object({
  name: z.string().min(1).max(255),
  billingEmail: z.string().email().optional().or(z.literal("")),
  phone: z.string().max(64).optional().or(z.literal("")),
  notes: z.string().max(4000).optional().or(z.literal("")),
});

export async function createCompanyAccountAction(formData: FormData) {
  try {
    const access = await requireCrmMutation();
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, dataUserId } = access.actor;
    const parsed = companySchema.safeParse({
      name: formData.get("name"),
      billingEmail: formData.get("billingEmail"),
      phone: formData.get("phone"),
      notes: formData.get("notes"),
    });
    if (!parsed.success) return { error: "Company name is required." };

    await prisma.companyAccount.create({
      data: {
        userId: dataUserId,
        name: parsed.data.name,
        billingEmail: parsed.data.billingEmail || null,
        phone: parsed.data.phone || null,
        notes: parsed.data.notes || null,
      },
    });
    revalidateAll();
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function createCompanyAccountFormAction(formData: FormData): Promise<void> {
  void (await createCompanyAccountAction(formData));
}

/* ============================ archive ============================ */

export async function archiveCustomerAction(formData: FormData) {
  try {
    const access = await requireCrmMutation();
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, dataUserId } = access.actor;
    const id = String(formData.get("customerId") ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Invalid customer id." };
    await archiveCustomer({ userId: dataUserId }, id);
    revalidateAll(id);
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function archiveCustomerFormAction(formData: FormData): Promise<void> {
  void (await archiveCustomerAction(formData));
}

/* ============================ metrics recompute ============================ */

export async function recomputeCrmMetricsAction(_formData: FormData) {
  try {
    const access = await requireCrmMutation();
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, dataUserId } = access.actor;
    const r = await recomputeAllCustomerMetrics(dataUserId);
    revalidateAll();
    return { ok: true as const, ...r };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function recomputeCrmMetricsFormAction(formData: FormData): Promise<void> {
  void (await recomputeCrmMetricsAction(formData));
}

