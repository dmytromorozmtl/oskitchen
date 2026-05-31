import oauthAppsConfig from "@/config/platform/partner-oauth-apps.json";

import {
  PARTNER_OAUTH_FORBIDDEN_SCOPES,
  type PartnerOAuthScope,
  validatePartnerOAuthScopes,
} from "@/lib/developer/partner-oauth-scopes";

export const PARTNER_OAUTH_APPS_CONFIG_PATH = "config/platform/partner-oauth-apps.json" as const;

export type PartnerOAuthAppStatus = "SANDBOX" | "REVIEW" | "PUBLISHED" | "SUSPENDED";

export type PartnerOAuthAppDefinition = {
  clientId: string;
  name: string;
  publisher: string;
  status: PartnerOAuthAppStatus;
  description: string;
  redirectUris: string[];
  allowedScopes: PartnerOAuthScope[];
  honestyNote?: string;
};

export function loadPartnerOAuthAppsConfig() {
  return oauthAppsConfig as {
    version: number;
    updatedAt: string;
    apps: PartnerOAuthAppDefinition[];
  };
}

export function listPartnerOAuthAppDefinitions(): PartnerOAuthAppDefinition[] {
  return loadPartnerOAuthAppsConfig().apps;
}

export function getPartnerOAuthAppByClientId(clientId: string): PartnerOAuthAppDefinition | null {
  return listPartnerOAuthAppDefinitions().find((app) => app.clientId === clientId) ?? null;
}

export function validatePartnerOAuthAppDefinition(app: PartnerOAuthAppDefinition): string[] {
  const errors: string[] = [];
  if (!app.clientId?.trim()) errors.push("missing clientId");
  if (!app.name?.trim()) errors.push("missing name");
  if (!app.redirectUris?.length) errors.push("redirectUris required");
  const scopeErrors = validatePartnerOAuthScopes(app.allowedScopes ?? []);
  errors.push(...scopeErrors);
  for (const forbidden of PARTNER_OAUTH_FORBIDDEN_SCOPES) {
    if ((app.allowedScopes ?? []).includes(forbidden)) {
      errors.push(`forbidden scope in app manifest: ${forbidden}`);
    }
  }
  return errors;
}

export function isRedirectUriAllowed(app: PartnerOAuthAppDefinition, redirectUri: string): boolean {
  return app.redirectUris.some((uri) => uri === redirectUri.trim());
}

export function resolvePartnerOAuthClientSecret(clientId: string): string | null {
  const envKey = `PARTNER_OAUTH_CLIENT_SECRET_${clientId.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
  const specific = process.env[envKey]?.trim();
  if (specific) return specific;
  const sandbox = process.env.PARTNER_OAUTH_SANDBOX_SECRET?.trim();
  if (sandbox) return sandbox;
  return null;
}

export function buildPartnerOAuthAuthorizeUrl(input: {
  clientId: string;
  redirectUri: string;
  scopes: PartnerOAuthScope[];
  state?: string;
  origin: string;
}): string {
  const params = new URLSearchParams({
    client_id: input.clientId,
    redirect_uri: input.redirectUri,
    response_type: "code",
    scope: input.scopes.join(" "),
  });
  if (input.state) params.set("state", input.state);
  return `${input.origin}/api/oauth/authorize?${params.toString()}`;
}
