"use server";


import { fail, ok, type ActionResult } from "@/lib/action-result";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { createClient } from "@/lib/supabase/server";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export async function changePasswordAction(
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const { sessionUser } = await requireTenantActor();
  const email = sessionUser.email;
  if (!email) return fail("No email on account");

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.currentPassword,
  });
  if (verifyError) return fail("Current password is incorrect");

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });

  if (error) return fail(error.message);
  return ok(undefined);
}
