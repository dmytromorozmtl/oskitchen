"use server";


import { fail, ok } from "@/lib/action-result";
import { requireSessionUser } from "@/lib/auth";
import {
  AccountDeletionBlockedError,
  requestAccountDeletion,
} from "@/services/user/user-deletion-service";

export async function requestAccountDeletionAction(): Promise<{
  ok: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const session = await requireSessionUser();
    const result = await requestAccountDeletion(session.id);
    return { ok: true, message: result.message };
  } catch (e) {
    if (e instanceof AccountDeletionBlockedError) {
      return { ok: false, error: e.message };
    }
    return { ok: false, error: "Could not schedule account deletion." };
  }
}
