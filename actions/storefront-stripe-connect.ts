"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { createStorefrontConnectAccountLink } from "@/services/storefront/storefront-stripe-connect-service";

export async function startStorefrontStripeConnectAction(): Promise<
  { ok: true; url: string } | { error: string }
> {
  const { sessionUser: user } = await requireTenantActor();
  const res = await createStorefrontConnectAccountLink(user.id);
  if (!res.ok) return { error: res.error };
  revalidatePath("/dashboard/storefront/ordering");
  return { ok: true, url: res.url };
}
