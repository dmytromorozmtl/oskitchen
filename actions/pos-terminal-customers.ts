"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { CustomerSource } from "@prisma/client";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { normalizeEmail } from "@/lib/crm/customer-dedupe";
import { canUseFeature } from "@/lib/plans/feature-registry";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { listCustomersForUser, upsertCustomerByEmail } from "@/services/crm/customer-service";
import { consumeRateLimitToken } from "@/services/security/rate-limit-service";

const searchSchema = z.object({
  q: z.string().min(2).max(120),
});

function pickCustomerLabel(c: { displayName: string | null; name: string | null; email: string }) {
  const d = c.displayName?.trim();
  if (d) return d;
  const n = c.name?.trim();
  if (n) return n;
  const local = c.email.split("@")[0];
  return local || c.email;
}

async function requirePosCrmAccess(userId: string): Promise<
  | { ok: true }
  | { ok: false; error: string }
> {
  const pos = await canUseFeature(userId, "pos_terminal");
  if (!pos.allowed) {
    return { ok: false, error: pos.reason ? `POS unavailable (${pos.reason}).` : "POS is not enabled for this plan." };
  }
  const crm = await canUseFeature(userId, "customer_crm");
  if (!crm.allowed) {
    return {
      ok: false,
      error: crm.reason
        ? `CRM customers unavailable (${crm.reason}).`
        : "Customer CRM is not enabled for this plan — upgrade to attach POS sales to profiles.",
    };
  }
  return { ok: true };
}

export async function posSearchKitchenCustomersAction(raw: unknown) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const access = await requirePosCrmAccess(user.id);
    if (!access.ok) return { ok: false as const, error: access.error };

    const rl = await consumeRateLimitToken(`pos_crm_search:${user.id}`, "pos_crm_customer_search");
    if (!rl.ok) {
      return {
        ok: false as const,
        error: `Too many searches — try again in ${Math.ceil(rl.retryAfterMs / 1000)}s.`,
      };
    }

    const { q } = searchSchema.parse(raw);
    const rows = await listCustomersForUser({ userId: dataUserId }, { search: q, take: 15 });
    return {
      ok: true as const,
      customers: rows.map((c) => ({
        id: c.id,
        email: c.email,
        label: pickCustomerLabel(c),
        phone: c.phone,
      })),
    };
  } catch (e) {
    return { ok: false as const, error: safeError(e) };
  }
}

const quickCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200),
  phone: z.string().max(64).optional().or(z.literal("")),
});

export async function posQuickCreateKitchenCustomerAction(raw: unknown) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const access = await requirePosCrmAccess(user.id);
    if (!access.ok) return { ok: false as const, error: access.error };

    const rl = await consumeRateLimitToken(`pos_crm_upsert:${user.id}`, "pos_crm_customer_upsert");
    if (!rl.ok) {
      return {
        ok: false as const,
        error: `Too many create attempts — try again in ${Math.ceil(rl.retryAfterMs / 1000)}s.`,
      };
    }

    const d = quickCreateSchema.parse(raw);
    const phone = d.phone?.trim() ? d.phone.trim() : null;
    const email = normalizeEmail(d.email);
    if (!email) {
      return { ok: false as const, error: "Enter a valid email address." };
    }

    const existing = await prisma.kitchenCustomer.findUnique({
      where: { userId_email: { userId: dataUserId, email } },
      select: { id: true },
    });

    const customer = await upsertCustomerByEmail({
      userId: dataUserId,
      email: d.email,
      name: d.name,
      phone,
      source: CustomerSource.MANUAL,
    });
    revalidatePath("/dashboard/customers");
    return {
      ok: true as const,
      mergedFromExisting: Boolean(existing),
      customer: {
        id: customer.id,
        email: customer.email,
        label: pickCustomerLabel(customer),
        phone: customer.phone,
      },
    };
  } catch (e) {
    return { ok: false as const, error: safeError(e) };
  }
}
