"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok } from "@/lib/action-result";
import type { SsoIdpVendor } from "@prisma/client";
import {
  activatePilotWorkspaceSso,
  configurePilotWorkspaceSso,
  deactivatePilotWorkspaceSso,
  getWorkspaceSsoAdminView,
} from "@/lib/enterprise/workspace-sso-admin-service";
import { initiateWorkspaceSsoLogin } from "@/lib/enterprise/workspace-sso-login-initiate";
import { requireSettingsCenterMutation } from "@/lib/settings/require-settings-center-mutation";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeInternalNextPath } from "@/lib/auth/safe-redirect";

const configureSchema = z.object({
  idpVendor: z.enum(["OKTA", "ENTRA_ID"]),
  allowedEmailDomains: z.string().min(1, "At least one email domain is required"),
  supabaseSsoProviderRef: z.string().min(1, "Supabase SSO provider reference is required"),
  loginHintDomain: z.string().optional(),
  breakGlassOwnerEnabled: z.coerce.boolean().optional(),
});

function parseDomains(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

async function requireSsoAdminActor(operation: string) {
  const gate = await requireSettingsCenterMutation("manage_security", operation);
  if (!gate.ok) return { ok: false as const, error: "You do not have permission to manage SSO settings." };
  const actor = await requireTenantActor();
  if (!actor.workspaceId) {
    return { ok: false as const, error: "Workspace is not provisioned for SSO configuration." };
  }
  return { ok: true as const, actor };
}

export async function loadWorkspaceSsoAdminViewAction() {
  const access = await requireSsoAdminActor("sso.admin.view");
  if (!access.ok) return fail(access.error);

  const view = await getWorkspaceSsoAdminView({
    workspaceId: access.actor.workspaceId!,
    ownerUserId: access.actor.userId,
  });

  return ok(view);
}

export async function configureWorkspaceSsoPilotAction(formData: FormData) {
  const access = await requireSsoAdminActor("sso.admin.configure");
  if (!access.ok) return fail(access.error);

  const parsed = configureSchema.safeParse({
    idpVendor: String(formData.get("idpVendor") ?? ""),
    allowedEmailDomains: String(formData.get("allowedEmailDomains") ?? ""),
    supabaseSsoProviderRef: String(formData.get("supabaseSsoProviderRef") ?? ""),
    loginHintDomain: String(formData.get("loginHintDomain") ?? "") || undefined,
    breakGlassOwnerEnabled: formData.get("breakGlassOwnerEnabled") === "on",
  });
  if (!parsed.success) {
    return fail(parsed.error.flatten().fieldErrors.idpVendor?.[0] ?? "Invalid SSO configuration.");
  }

  const result = await configurePilotWorkspaceSso({
    workspaceId: access.actor.workspaceId!,
    ownerUserId: access.actor.userId,
    actorUserId: access.actor.sessionUserId,
    idpVendor: parsed.data.idpVendor as SsoIdpVendor,
    allowedEmailDomains: parseDomains(parsed.data.allowedEmailDomains),
    supabaseSsoProviderRef: parsed.data.supabaseSsoProviderRef,
    loginHintDomain: parsed.data.loginHintDomain ?? null,
    breakGlassOwnerEnabled: parsed.data.breakGlassOwnerEnabled ?? true,
  });

  if (!result.ok) return fail(result.error);

  revalidatePath("/dashboard/settings/security/sso");
  revalidatePath("/dashboard/settings/security");
  return ok(undefined);
}

export async function activateWorkspaceSsoPilotAction() {
  const access = await requireSsoAdminActor("sso.admin.activate");
  if (!access.ok) return fail(access.error);

  const result = await activatePilotWorkspaceSso({
    workspaceId: access.actor.workspaceId!,
    ownerUserId: access.actor.userId,
    actorUserId: access.actor.sessionUserId,
  });
  if (!result.ok) return fail(result.error);

  revalidatePath("/dashboard/settings/security/sso");
  revalidatePath("/login");
  return ok(undefined);
}

export async function deactivateWorkspaceSsoPilotAction() {
  const access = await requireSsoAdminActor("sso.admin.deactivate");
  if (!access.ok) return fail(access.error);

  await deactivatePilotWorkspaceSso({
    workspaceId: access.actor.workspaceId!,
    actorUserId: access.actor.sessionUserId,
  });

  revalidatePath("/dashboard/settings/security/sso");
  revalidatePath("/login");
  return ok(undefined);
}

/** Public login entry — only succeeds when workspace SSO is PILOT_ACTIVE. */
export async function initiateWorkspaceSsoLoginAction(formData: FormData) {
  const workspaceId = String(formData.get("workspaceId") ?? "").trim();
  const rawNext = String(formData.get("redirect") ?? "").trim() || null;
  const nextPath = safeInternalNextPath(rawNext, "/dashboard/today");

  const result = await initiateWorkspaceSsoLogin({ workspaceId, nextPath });
  if (!result.ok) return fail(result.error);

  return ok({ redirectUrl: result.redirectUrl });
}
