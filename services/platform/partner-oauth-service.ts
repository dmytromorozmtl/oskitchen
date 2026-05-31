import { createHash, randomBytes } from "crypto";

import type { Prisma } from "@prisma/client";
import { PartnerAppInstallationStatus } from "@prisma/client";

import { recordAuditLog } from "@/lib/audit-log";
import { hashApiKey } from "@/lib/api-public/auth";
import {
  intersectPartnerOAuthScopes,
  parsePartnerOAuthScopeList,
  type PartnerOAuthScope,
  validatePartnerOAuthScopes,
} from "@/lib/developer/partner-oauth-scopes";
import {
  getMergedPartnerOAuthAppByClientId,
  isPartnerOAuthAppInstallable,
} from "@/services/platform/partner-oauth-app-registry-service";
import { isRedirectUriAllowed, resolvePartnerOAuthClientSecret } from "@/lib/oauth/partner-oauth-app-catalog";
import type { PartnerOAuthAppDefinition } from "@/lib/oauth/partner-oauth-app-catalog";
import { prisma } from "@/lib/prisma";
import { resolveOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";

const AUTH_CODE_TTL_MS = 10 * 60 * 1000;
export const PARTNER_OAUTH_TOKEN_PREFIX = "koa_" as const;

export type PartnerOAuthAuthorizeParams = {
  clientId: string;
  redirectUri: string;
  responseType: string;
  scope: string;
  state?: string | null;
};

export type PartnerAppInstallationView = {
  id: string;
  clientId: string;
  appName: string;
  publisher: string;
  scopesGranted: PartnerOAuthScope[];
  status: PartnerAppInstallationStatus;
  tokenPrefix: string;
  installedAt: Date;
  lastUsedAt: Date | null;
  embedUrl: string | null;
};

function hashOAuthCode(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

function generateAuthorizationCode(): string {
  return randomBytes(32).toString("hex");
}

function generateAccessToken(): string {
  return `${PARTNER_OAUTH_TOKEN_PREFIX}${randomBytes(32).toString("hex")}`;
}

export function validatePartnerOAuthAuthorizeParamsWithApp(
  params: PartnerOAuthAuthorizeParams,
  app: PartnerOAuthAppDefinition,
): { ok: true; app: PartnerOAuthAppDefinition; scopes: PartnerOAuthScope[] } | { ok: false; error: string } {
  if (params.responseType !== "code") {
    return { ok: false, error: "Unsupported response_type — only `code` is supported." };
  }

  if (app.status === "SUSPENDED") return { ok: false, error: "This app is suspended." };
  if (!isPartnerOAuthAppInstallable(app.status)) {
    return { ok: false, error: "This app is not published for installation yet." };
  }

  if (!isRedirectUriAllowed(app, params.redirectUri)) {
    return { ok: false, error: "redirect_uri is not registered for this app." };
  }

  const requested = parsePartnerOAuthScopeList(params.scope);
  const scopeErrors = validatePartnerOAuthScopes(requested);
  if (scopeErrors.length > 0) return { ok: false, error: scopeErrors[0] ?? "Invalid scope." };

  const scopes = intersectPartnerOAuthScopes(requested, app.allowedScopes);
  if (scopes.length === 0) {
    return { ok: false, error: "No allowed scopes requested." };
  }

  return { ok: true, app, scopes };
}

export async function validatePartnerOAuthAuthorizeParams(
  params: PartnerOAuthAuthorizeParams,
): Promise<
  { ok: true; app: PartnerOAuthAppDefinition; scopes: PartnerOAuthScope[] } | { ok: false; error: string }
> {
  const app = await getMergedPartnerOAuthAppByClientId(params.clientId.trim());
  if (!app) return { ok: false, error: "Unknown client_id." };
  return validatePartnerOAuthAuthorizeParamsWithApp(params, app);
}

export async function createPartnerOAuthAuthorizationCode(input: {
  ownerUserId: string;
  workspaceId: string | null;
  installedByUserId: string;
  clientId: string;
  redirectUri: string;
  scopes: PartnerOAuthScope[];
  state?: string | null;
}): Promise<{ code: string; expiresAt: Date }> {
  const rawCode = generateAuthorizationCode();
  const expiresAt = new Date(Date.now() + AUTH_CODE_TTL_MS);

  await prisma.oAuthAuthorizationCode.create({
    data: {
      codeHash: hashOAuthCode(rawCode),
      clientId: input.clientId,
      userId: input.ownerUserId,
      workspaceId: input.workspaceId,
      installedByUserId: input.installedByUserId,
      scopes: input.scopes,
      redirectUri: input.redirectUri,
      state: input.state?.trim() || null,
      expiresAt,
    },
  });

  await recordAuditLog({
    userId: input.installedByUserId,
    workspaceId: input.workspaceId,
    action: "PARTNER_OAUTH_AUTHORIZATION_GRANTED",
    entityType: "PartnerOAuthApp",
    entityId: input.clientId,
    metadata: { scopes: input.scopes, redirectUri: input.redirectUri },
  });

  return { code: rawCode, expiresAt };
}

export async function exchangePartnerOAuthAuthorizationCode(input: {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
}): Promise<
  | {
      ok: true;
      accessToken: string;
      tokenType: "Bearer";
      scope: string;
      installationId: string;
    }
  | { ok: false; error: string }
> {
  const app = await getMergedPartnerOAuthAppByClientId(input.clientId.trim());
  if (!app) return { ok: false, error: "invalid_client" };
  if (!isPartnerOAuthAppInstallable(app.status)) {
    return { ok: false, error: "invalid_client" };
  }

  const expectedSecret = resolvePartnerOAuthClientSecret(app.clientId);
  if (!expectedSecret || input.clientSecret !== expectedSecret) {
    return { ok: false, error: "invalid_client" };
  }

  if (!isRedirectUriAllowed(app, input.redirectUri)) {
    return { ok: false, error: "invalid_grant" };
  }

  const codeRow = await prisma.oAuthAuthorizationCode.findUnique({
    where: { codeHash: hashOAuthCode(input.code.trim()) },
  });
  if (!codeRow || codeRow.clientId !== app.clientId) {
    return { ok: false, error: "invalid_grant" };
  }
  if (codeRow.consumedAt) return { ok: false, error: "invalid_grant" };
  if (codeRow.expiresAt.getTime() < Date.now()) return { ok: false, error: "invalid_grant" };
  if (codeRow.redirectUri !== input.redirectUri.trim()) {
    return { ok: false, error: "invalid_grant" };
  }

  const scopes = codeRow.scopes.filter((s): s is PartnerOAuthScope =>
    app.allowedScopes.includes(s as PartnerOAuthScope),
  );
  if (scopes.length === 0) return { ok: false, error: "invalid_scope" };

  const accessToken = generateAccessToken();
  const tokenHash = hashApiKey(accessToken);
  const tokenPrefix = accessToken.slice(0, 12);

  const installation = await prisma.$transaction(async (tx) => {
    await tx.oAuthAuthorizationCode.update({
      where: { id: codeRow.id },
      data: { consumedAt: new Date() },
    });

    const existing = await tx.partnerAppInstallation.findFirst({
      where: {
        workspaceId: codeRow.workspaceId,
        clientId: app.clientId,
      },
    });

    if (existing?.status === PartnerAppInstallationStatus.ACTIVE) {
      return tx.partnerAppInstallation.update({
        where: { id: existing.id },
        data: {
          scopesGranted: scopes,
          accessTokenHash: tokenHash,
          tokenPrefix,
          installedByUserId: codeRow.installedByUserId,
          revokedAt: null,
          status: PartnerAppInstallationStatus.ACTIVE,
        },
      });
    }

    if (existing) {
      return tx.partnerAppInstallation.update({
        where: { id: existing.id },
        data: {
          scopesGranted: scopes,
          accessTokenHash: tokenHash,
          tokenPrefix,
          installedByUserId: codeRow.installedByUserId,
          revokedAt: null,
          status: PartnerAppInstallationStatus.ACTIVE,
          installedAt: new Date(),
        },
      });
    }

    return tx.partnerAppInstallation.create({
      data: {
        clientId: app.clientId,
        userId: codeRow.userId,
        workspaceId: codeRow.workspaceId,
        installedByUserId: codeRow.installedByUserId,
        scopesGranted: scopes,
        accessTokenHash: tokenHash,
        tokenPrefix,
        status: PartnerAppInstallationStatus.ACTIVE,
      },
    });
  });

  await recordAuditLog({
    userId: codeRow.installedByUserId,
    workspaceId: codeRow.workspaceId,
    action: "PARTNER_OAUTH_APP_INSTALLED",
    entityType: "PartnerAppInstallation",
    entityId: installation.id,
    metadata: { clientId: app.clientId, scopes },
  });

  return {
    ok: true,
    accessToken,
    tokenType: "Bearer",
    scope: scopes.join(" "),
    installationId: installation.id,
  };
}

export async function listPartnerAppInstallationsForOwner(
  ownerUserId: string,
): Promise<PartnerAppInstallationView[]> {
  const scope = await resolveOwnerScopedWhere(ownerUserId);
  const rows = await prisma.partnerAppInstallation.findMany({
    where: scope as Prisma.PartnerAppInstallationWhereInput,
    orderBy: { installedAt: "desc" },
  });

  return Promise.all(
    rows.map(async (row) => {
      const app = await getMergedPartnerOAuthAppByClientId(row.clientId);
      return {
        id: row.id,
        clientId: row.clientId,
        appName: app?.name ?? row.clientId,
        publisher: app?.publisher ?? "Unknown publisher",
        scopesGranted: row.scopesGranted as PartnerOAuthScope[],
        status: row.status,
        tokenPrefix: row.tokenPrefix,
        installedAt: row.installedAt,
        lastUsedAt: row.lastUsedAt,
        embedUrl: app?.embedUrl ?? null,
      };
    }),
  );
}

export async function revokePartnerAppInstallation(input: {
  ownerUserId: string;
  installationId: string;
  actorUserId: string;
  workspaceId: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const scope = await resolveOwnerScopedWhere(input.ownerUserId);
  const row = await prisma.partnerAppInstallation.findFirst({
    where: { AND: [scope as Prisma.PartnerAppInstallationWhereInput, { id: input.installationId }] },
  });
  if (!row) return { ok: false, error: "Installation not found." };

  await prisma.partnerAppInstallation.update({
    where: { id: row.id },
    data: {
      status: PartnerAppInstallationStatus.REVOKED,
      revokedAt: new Date(),
    },
  });

  await recordAuditLog({
    userId: input.actorUserId,
    workspaceId: input.workspaceId,
    action: "PARTNER_OAUTH_APP_REVOKED",
    entityType: "PartnerAppInstallation",
    entityId: row.id,
    metadata: { clientId: row.clientId },
  });

  return { ok: true };
}

export function buildPartnerOAuthRedirectSuccessUrl(input: {
  redirectUri: string;
  code: string;
  state?: string | null;
}): string {
  const url = new URL(input.redirectUri);
  url.searchParams.set("code", input.code);
  if (input.state) url.searchParams.set("state", input.state);
  return url.toString();
}

export function buildPartnerOAuthRedirectErrorUrl(input: {
  redirectUri: string;
  error: string;
  state?: string | null;
}): string {
  const url = new URL(input.redirectUri);
  url.searchParams.set("error", input.error);
  if (input.state) url.searchParams.set("state", input.state);
  return url.toString();
}
