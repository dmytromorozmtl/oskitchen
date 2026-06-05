"use server";

import { revalidatePath } from "next/cache";

import { fail, ok } from "@/lib/action-result";
import { ENTERPRISE_SSO_SCIM_LIVE_PATH } from "@/lib/enterprise/enterprise-sso-scim-live-policy";
import {
  activateWorkspaceScim,
  getWorkspaceScimAdminView,
  rotateWorkspaceScimToken,
} from "@/lib/enterprise/workspace-scim-admin-service";
import { requireSettingsCenterMutation } from "@/lib/settings/require-settings-center-mutation";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";

async function requireScimAdminActor(operation: string) {
  const gate = await requireSettingsCenterMutation("manage_security", operation);
  if (!gate.ok) {
    return { ok: false as const, error: "You do not have permission to manage SCIM settings." };
  }
  const actor = await requireTenantActor();
  if (!actor.workspaceId) {
    return { ok: false as const, error: "Workspace is not provisioned for SCIM configuration." };
  }
  return { ok: true as const, actor };
}

export async function activateWorkspaceScimAction() {
  const gate = await requireScimAdminActor("activate_scim");
  if (!gate.ok) return fail(gate.error);

  try {
    const { bearerToken } = await activateWorkspaceScim({
      workspaceId: gate.actor.workspaceId!,
      ownerUserId: gate.actor.userId,
      actorUserId: gate.actor.userId,
    });
    revalidatePath(ENTERPRISE_SSO_SCIM_LIVE_PATH);
    revalidatePath("/dashboard/settings/security/sso");
    return ok({ bearerToken, message: "SCIM provisioning activated. Copy the bearer token now — it will not be shown again." });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to activate SCIM.");
  }
}

export async function rotateWorkspaceScimTokenAction() {
  const gate = await requireScimAdminActor("rotate_scim_token");
  if (!gate.ok) return fail(gate.error);

  try {
    const { bearerToken } = await rotateWorkspaceScimToken({
      workspaceId: gate.actor.workspaceId!,
      actorUserId: gate.actor.userId,
    });
    revalidatePath(ENTERPRISE_SSO_SCIM_LIVE_PATH);
    return ok({ bearerToken, message: "SCIM bearer token rotated. Update your IdP provisioning app." });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Failed to rotate SCIM token.");
  }
}

export async function loadWorkspaceScimAdminViewAction() {
  const gate = await requireScimAdminActor("view_scim");
  if (!gate.ok) return fail(gate.error);

  const view = await getWorkspaceScimAdminView({
    workspaceId: gate.actor.workspaceId!,
    ownerUserId: gate.actor.userId,
  });
  return ok(view);
}
