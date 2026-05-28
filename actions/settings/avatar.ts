"use server";

import { fail, ok, type ActionResult } from "@/lib/action-result";
import { revalidatePath } from "next/cache";

import { requireSelfAccountMutation } from "@/lib/settings/require-self-account-mutation";
import { uploadKitchenAsset } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { enforceUploadContentSafety } from "@/lib/upload-policy/enforce-upload-content-safety";
import {
  profileAvatarExtension,
  validateProfileAvatarUpload,
} from "@/lib/upload-policy/media-upload-validation";
import { logUploadDenied, logUploadSucceeded } from "@/services/audit/upload-audit";

export async function uploadAvatarAction(
  formData: FormData,
): Promise<ActionResult<{ avatarUrl: string }>> {
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return fail("Please choose an image file");
  }

  const account = await requireSelfAccountMutation("settings_avatar.upload");
  if (!account.ok) return fail(account.error);

  const { sessionUser, workspaceId } = account;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const validated = validateProfileAvatarUpload({
    bytes,
    mimeType: file.type || "",
  });
  if (!validated.ok) {
    void logUploadDenied({
      channel: "profile_avatar",
      actorUserId: sessionUser.id,
      workspaceId,
      entity: { type: "UploadBucket", id: "business-logos" },
      mimeType: file.type || null,
      sizeBytes: bytes.byteLength,
      reason: validated.error,
    });
    return fail(validated.error);
  }

  const safe = await enforceUploadContentSafety({
    bytes,
    mimeType: validated.mimeType,
    channel: "profile_avatar",
    actorUserId: sessionUser.id,
    workspaceId,
    entity: { type: "UploadBucket", id: "business-logos" },
  });
  if (!safe.ok) {
    return fail(safe.error);
  }

  const ext = profileAvatarExtension(validated.mimeType);
  const path = `avatars/${sessionUser.id}.${ext}`;
  const uploaded = await uploadKitchenAsset({
    bucket: "business-logos",
    path,
    bytes,
    contentType: validated.mimeType,
  });

  if ("error" in uploaded) {
    void logUploadDenied({
      channel: "profile_avatar",
      actorUserId: sessionUser.id,
      workspaceId,
      entity: { type: "UploadBucket", id: "business-logos" },
      mimeType: validated.mimeType,
      sizeBytes: bytes.byteLength,
      reason: uploaded.error,
    });
    return fail(uploaded.error);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { avatar_url: uploaded.publicUrl },
  });

  if (error) {
    void logUploadDenied({
      channel: "profile_avatar",
      actorUserId: sessionUser.id,
      workspaceId,
      entity: { type: "UploadBucket", id: "business-logos" },
      mimeType: validated.mimeType,
      sizeBytes: bytes.byteLength,
      reason: error.message,
    });
    return fail(error.message);
  }

  void logUploadSucceeded({
    channel: "profile_avatar",
    actorUserId: sessionUser.id,
    workspaceId,
    entity: { type: "UploadBucket", id: "business-logos" },
    mimeType: validated.mimeType,
    sizeBytes: bytes.byteLength,
    publicUrl: uploaded.publicUrl,
  });

  revalidatePath("/dashboard/settings/profile");
  return ok({ avatarUrl: uploaded.publicUrl });
}

export async function removeAvatarAction(): Promise<ActionResult<void>> {
  const account = await requireSelfAccountMutation("settings_avatar.remove");
  if (!account.ok) return fail(account.error);

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { avatar_url: null },
  });

  if (error) return fail(error.message);

  revalidatePath("/dashboard/settings/profile");
  return ok(undefined);
}
