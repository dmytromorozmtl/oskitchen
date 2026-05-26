"use server";

import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { createGrubhubOrder } from "@/services/integrations/grubhub/grubhub-service";

export async function testGrubhubOrderAction() {
  const { userId } = await requireTenantActor();
  const result = await createGrubhubOrder(userId, { externalOrderId: `test-${Date.now()}` });
  revalidatePath("/dashboard/integrations/grubhub");
  return result.ok ? ok(result) : fail(result.message, "provider_placeholder");
}
