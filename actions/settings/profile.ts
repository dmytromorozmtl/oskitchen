"use server";


import { fail, ok, type ActionResult } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(200),
  companyName: z.string().trim().max(200).optional(),
  phone: z.string().trim().max(40).optional(),
});

export async function updateProfileAction(
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { sessionUser } = await requireTenantActor();
  const { fullName, companyName, phone } = parsed.data;

  await prisma.userProfile.update({
    where: { id: sessionUser.id },
    data: {
      fullName,
      companyName: companyName?.trim() || null,
    },
  });

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      company_name: companyName?.trim() || undefined,
      phone: phone?.trim() || undefined,
    },
  });

  if (error) return fail(error.message);

  revalidatePath("/dashboard/settings/profile");
  return ok(undefined);
}
