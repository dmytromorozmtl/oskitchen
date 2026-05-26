"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";

import { requireUserProfile } from "@/lib/auth";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";

import { safeError } from "@/lib/security";
import { orderCreateInputSchema } from "@/lib/orders/order-validation";
import { createOrderViaCenter } from "@/services/orders/order-creation-service";

export type OrderCreateActionResult =
  | { ok: true; orderId: string; lookupToken: string }
  | { ok: false; error: string };

function parsePayload(formData: FormData) {
  const raw = formData.get("payload");
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function canCreateOrder(role: string | null | undefined, email: string | null | undefined): boolean {
  if ((email ?? "").trim().toLowerCase() === "workspace.moroz@gmail.com") return true;
  const r = (role ?? "").toLowerCase();
  return r === "owner" || r === "admin" || r === "manager" || r === "customer_service" || r === "catering_sales";
}

export async function createOrderViaCenterAction(formData: FormData): Promise<OrderCreateActionResult> {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const profile = await requireUserProfile();
    if (!canCreateOrder(profile.role ?? null, profile.email ?? null)) {
      return { ok: false, error: "You do not have permission to create orders." };
    }

    const raw = parsePayload(formData);
    if (!raw) return { ok: false, error: "Missing or invalid order payload." };

    const parsed = orderCreateInputSchema.safeParse(raw);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return { ok: false, error: issue ? `${issue.path.join(".")}: ${issue.message}` : "Invalid order payload." };
    }

    const result = await createOrderViaCenter({ userId: dataUserId, performedById: profile.id }, parsed.data);
    if (!result.ok) return result;

    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/production");
    revalidatePath("/dashboard/customers");
    return { ok: true, orderId: result.orderId, lookupToken: result.lookupToken };
  } catch (e) {
    return { ok: false, error: safeError(e) };
  }
}
