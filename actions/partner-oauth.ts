"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireIntegrationsActor } from "@/lib/integrations/require-integrations-actor";
import {
  buildPartnerOAuthRedirectErrorUrl,
  buildPartnerOAuthRedirectSuccessUrl,
  createPartnerOAuthAuthorizationCode,
  listPartnerAppInstallationsForOwner,
  revokePartnerAppInstallation,
  validatePartnerOAuthAuthorizeParams,
} from "@/services/platform/partner-oauth-service";
import { listMergedPartnerOAuthAppDefinitions } from "@/services/platform/partner-oauth-app-registry-service";

const consentSchema = z.object({
  client_id: z.string().min(1),
  redirect_uri: z.string().url(),
  scope: z.string().min(1),
  state: z.string().optional(),
});

export async function loadPartnerOAuthHubDataAction() {
  const access = await requireIntegrationsActor({ operation: "partner_oauth.read" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const [installations, apps] = await Promise.all([
    listPartnerAppInstallationsForOwner(access.actor.userId),
    listMergedPartnerOAuthAppDefinitions(),
  ]);

  return { ok: true as const, installations, apps };
}

export async function approvePartnerOAuthConsentAction(raw: z.infer<typeof consentSchema>) {
  const access = await requireIntegrationsActor({ operation: "partner_oauth.consent" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const input = consentSchema.safeParse(raw);
  if (!input.success) return { ok: false as const, error: "Invalid consent request." };

  const validated = await validatePartnerOAuthAuthorizeParams({
    clientId: input.data.client_id,
    redirectUri: input.data.redirect_uri,
    responseType: "code",
    scope: input.data.scope,
    state: input.data.state,
  });
  if (!validated.ok) {
    const errorUrl = buildPartnerOAuthRedirectErrorUrl({
      redirectUri: input.data.redirect_uri,
      error: validated.error,
      state: input.data.state,
    });
    redirect(errorUrl);
  }

  const issued = await createPartnerOAuthAuthorizationCode({
    ownerUserId: access.actor.userId,
    workspaceId: access.workspaceId,
    installedByUserId: access.actor.sessionUser.id,
    clientId: validated.app.clientId,
    redirectUri: input.data.redirect_uri,
    scopes: validated.scopes,
    state: input.data.state,
  });

  revalidatePath("/dashboard/integrations/oauth-apps");

  const successUrl = buildPartnerOAuthRedirectSuccessUrl({
    redirectUri: input.data.redirect_uri,
    code: issued.code,
    state: input.data.state,
  });
  redirect(successUrl);
}

export async function denyPartnerOAuthConsentAction(raw: {
  redirect_uri: string;
  state?: string;
}) {
  const access = await requireIntegrationsActor({ operation: "partner_oauth.consent" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const errorUrl = buildPartnerOAuthRedirectErrorUrl({
    redirectUri: raw.redirect_uri,
    error: "access_denied",
    state: raw.state,
  });
  redirect(errorUrl);
}

export async function revokePartnerOAuthInstallationAction(installationId: string) {
  const access = await requireIntegrationsActor({ operation: "partner_oauth.revoke" });
  if (!access.ok) return { ok: false as const, error: access.error };

  const result = await revokePartnerAppInstallation({
    ownerUserId: access.actor.userId,
    installationId,
    actorUserId: access.actor.sessionUser.id,
    workspaceId: access.workspaceId,
  });

  if (!result.ok) return { ok: false as const, error: result.error };

  revalidatePath("/dashboard/integrations/oauth-apps");
  revalidatePath("/dashboard/integrations/extensions");
  return { ok: true as const };
}
