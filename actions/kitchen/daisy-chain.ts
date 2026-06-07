"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok } from "@/lib/action-result";
import { toggleKdsDaisyChainLink } from "@/lib/kitchen/kds-daisy-chain-config-storage";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";

const toggleSchema = z.object({
  linkId: z.string().min(1),
  enabled: z.enum(["true", "false"]),
});

function revalidateDaisyChain() {
  revalidatePath("/dashboard/kitchen/daisy-chain");
  revalidatePath("/dashboard/kitchen/routing-rules");
  revalidatePath("/dashboard/kitchen/production");
  revalidatePath("/dashboard/kitchen");
}

export async function toggleKdsDaisyChainLinkAction(formData: FormData) {
  const access = await requireMutationPermission("kitchen.configure");
  if (!access.ok) return fail(access.error);

  const parsed = toggleSchema.safeParse({
    linkId: formData.get("linkId"),
    enabled: formData.get("enabled"),
  });
  if (!parsed.success) return fail("Invalid daisy-chain toggle.");

  await toggleKdsDaisyChainLink(
    access.actor.userId,
    parsed.data.linkId,
    parsed.data.enabled === "true",
  );
  revalidateDaisyChain();
  return ok({ linkId: parsed.data.linkId });
}
