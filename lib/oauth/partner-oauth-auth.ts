import { hashApiKeyCandidates } from "@/lib/api-public/auth";
import { parseApiKeyScopesJson } from "@/lib/api-public/public-api-scopes";
import type { PublicApiCredential } from "@/lib/api-public/auth";
import {
  partnerOAuthScopesToDeveloperScopes,
  type PartnerOAuthScope,
} from "@/lib/developer/partner-oauth-scopes";
import { PARTNER_OAUTH_TOKEN_PREFIX } from "@/services/platform/partner-oauth-service";
import { PartnerAppInstallationStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type PartnerOAuthCredential = PublicApiCredential & {
  authKind: "partner_oauth";
  installationId: string;
  clientId: string;
  oauthScopes: readonly PartnerOAuthScope[];
};

export async function resolvePartnerOAuthCredential(
  authHeader: string | null,
): Promise<PartnerOAuthCredential | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const raw = authHeader.slice("Bearer ".length).trim();
  if (!raw.startsWith(PARTNER_OAUTH_TOKEN_PREFIX) || raw.length < 20) return null;

  const digests = hashApiKeyCandidates(raw);
  const row = await prisma.partnerAppInstallation.findFirst({
    where: {
      accessTokenHash: { in: digests },
      status: PartnerAppInstallationStatus.ACTIVE,
    },
    select: {
      id: true,
      userId: true,
      clientId: true,
      scopesGranted: true,
    },
  });
  if (!row) return null;

  await prisma.partnerAppInstallation
    .update({
      where: { id: row.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => undefined);

  const oauthScopes = row.scopesGranted as PartnerOAuthScope[];
  const developerScopes = partnerOAuthScopesToDeveloperScopes(oauthScopes);

  return {
    userId: row.userId,
    scopes: developerScopes.length > 0 ? developerScopes : parseApiKeyScopesJson(null),
    authKind: "partner_oauth",
    installationId: row.id,
    clientId: row.clientId,
    oauthScopes,
  };
}

export function isPartnerOAuthCredential(
  credential: PublicApiCredential,
): credential is PartnerOAuthCredential {
  return (credential as PartnerOAuthCredential).authKind === "partner_oauth";
}
