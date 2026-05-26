"use server";


import { fail, ok, type ActionResult } from "@/lib/action-result";
import { revalidatePath } from "next/cache";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { uploadKitchenAsset } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function uploadAvatarAction(
  formData: FormData,
): Promise<ActionResult<{ avatarUrl: string }>> {
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return fail("Please choose an image file");
  }

  if (!ALLOWED.has(file.type)) {
    return fail("Only JPEG, PNG, or WebP images are allowed");
  }

  if (file.size > MAX_BYTES) {
    return fail("Image must be 2MB or smaller");
  }

  const { sessionUser } = await requireTenantActor();
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `avatars/${sessionUser.id}.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const uploaded = await uploadKitchenAsset({
    bucket: "business-logos",
    path,
    bytes,
    contentType: file.type,
  });

  if ("error" in uploaded) return fail(uploaded.error);

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { avatar_url: uploaded.publicUrl },
  });

  if (error) return fail(error.message);

  revalidatePath("/dashboard/settings/profile");
  return ok({ avatarUrl: uploaded.publicUrl });
}

export async function removeAvatarAction(): Promise<ActionResult<void>> {
  await requireTenantActor();
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { avatar_url: null },
  });

  if (error) return fail(error.message);

  revalidatePath("/dashboard/settings/profile");
  return ok(undefined);
}
