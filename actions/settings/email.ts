"use server";


import { fail, ok, type ActionResult } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const emailSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

export async function changeEmailAction(
  formData: FormData,
): Promise<ActionResult<{ message: string }>> {
  const parsed = emailSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { sessionUser } = await requireTenantActor();
  const nextEmail = parsed.data.email.toLowerCase();

  if (nextEmail === sessionUser.email?.toLowerCase()) {
    return fail("This is already your email address");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ email: nextEmail });

  if (error) return fail(error.message);

  await prisma.userProfile.update({
    where: { id: sessionUser.id },
    data: { email: nextEmail },
  });

  revalidatePath("/dashboard/settings/profile");
  return ok({ message: "Confirmation sent — check your inbox to verify the new address.", });
}
