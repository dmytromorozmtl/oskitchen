"use server";


import { fail, ok, type ActionResult } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSelfAccountMutation } from "@/lib/settings/require-self-account-mutation";
import { createClient } from "@/lib/supabase/server";

const prefsSchema = z.object({
  emailEnabled: z.coerce.boolean(),
  pushEnabled: z.coerce.boolean(),
  smsEnabled: z.coerce.boolean(),
});

export async function saveAccountNotificationPrefsAction(
  formData: FormData,
): Promise<ActionResult<void>> {
  const parsed = prefsSchema.safeParse({
    emailEnabled: formData.get("emailEnabled") === "on",
    pushEnabled: formData.get("pushEnabled") === "on",
    smsEnabled: formData.get("smsEnabled") === "on",
  });

  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  await requireSelfAccountMutation("settings_account_notifications.save");

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { notification_prefs: parsed.data },
  });

  if (error) return fail(error.message);

  revalidatePath("/dashboard/settings/notifications");
  return ok(undefined);
}
