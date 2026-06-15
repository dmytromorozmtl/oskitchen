import { z } from "zod";

import {
  CAPITAL_OAUTH_SCOPES,
  type CapitalOAuthScope,
  type PartnerOAuthScope,
} from "@/lib/developer/partner-oauth-scopes";
import { getPartnerOAuthAppByClientId } from "@/lib/oauth/partner-oauth-app-catalog";

export const CAPITAL_OAUTH_STATE_PREFIX = "capital:" as const;

const capitalOAuthStateSchema = z.object({
  referralId: z.string().uuid(),
});

export function isCapitalLenderOAuthEnabled(): boolean {
  if (process.env.CAPITAL_LENDER_OAUTH === "1") return true;
  return process.env.NODE_ENV !== "production";
}

export function buildCapitalOAuthState(referralId: string): string {
  return `${CAPITAL_OAUTH_STATE_PREFIX}${referralId}`;
}

export function parseCapitalOAuthState(state: string | null | undefined): string | null {
  const trimmed = state?.trim();
  if (!trimmed?.startsWith(CAPITAL_OAUTH_STATE_PREFIX)) return null;
  const referralId = trimmed.slice(CAPITAL_OAUTH_STATE_PREFIX.length).trim();
  const parsed = capitalOAuthStateSchema.safeParse({ referralId });
  return parsed.success ? parsed.data.referralId : null;
}

export function defaultCapitalOAuthScopes(): CapitalOAuthScope[] {
  return ["read:capital_attestation", "read:capital_referrals"];
}

export function intersectCapitalOAuthScopes(
  requested: readonly PartnerOAuthScope[],
): CapitalOAuthScope[] {
  const allowed = new Set<string>(CAPITAL_OAUTH_SCOPES);
  return requested.filter((scope): scope is CapitalOAuthScope => allowed.has(scope));
}

export function resolveCapitalOAuthRedirectUri(clientId: string): string | null {
  const app = getPartnerOAuthAppByClientId(clientId);
  return app?.redirectUris[0]?.trim() || null;
}

export const CAPITAL_LENDER_OAUTH_CONSENT_NOTE =
  "OAuth authorization lets the financing partner pull your signed revenue export using a scoped access token instead of a one-time share link.";
