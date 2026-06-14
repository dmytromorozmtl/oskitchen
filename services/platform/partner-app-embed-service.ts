import { PartnerAppInstallationStatus } from "@prisma/client";

import {
  mintPartnerAppEmbedToken,
  partnerAppEmbedTokenTtlSeconds,
} from "@/lib/oauth/partner-app-embed-token";
import { resolveOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { getMergedPartnerOAuthAppByClientId } from "@/services/platform/partner-oauth-app-registry-service";

function resolvePartnerEmbedUrl(embedUrl: string, origin?: string): URL {
  try {
    return new URL(embedUrl);
  } catch {
    const base = origin?.trim() || "http://localhost:3000";
    return new URL(embedUrl.startsWith("/") ? embedUrl : `/${embedUrl}`, base);
  }
}

export async function issuePartnerAppEmbedSession(input: {
  ownerUserId: string;
  clientId: string;
  origin?: string;
}): Promise<
  | {
      ok: true;
      token: string;
      embedUrl: string;
      expiresInSeconds: number;
      installationId: string;
    }
  | { ok: false; error: string }
> {
  const app = await getMergedPartnerOAuthAppByClientId(input.clientId);
  if (!app?.embedUrl) {
    return { ok: false, error: "This app does not expose an embedded admin surface." };
  }

  const scope = await resolveOwnerScopedWhere(input.ownerUserId);
  const installation = await prisma.partnerAppInstallation.findFirst({
    where: {
      AND: [scope, { clientId: input.clientId, status: PartnerAppInstallationStatus.ACTIVE }],
    },
  });
  if (!installation) {
    return { ok: false, error: "Install the OAuth app before opening embedded admin." };
  }

  const token = mintPartnerAppEmbedToken({
    installationId: installation.id,
    workspaceId: installation.workspaceId,
    clientId: installation.clientId,
    userId: installation.userId,
  });

  const embedUrl = resolvePartnerEmbedUrl(app.embedUrl, input.origin);
  embedUrl.searchParams.set("embed_token", token);

  return {
    ok: true,
    token,
    embedUrl: embedUrl.toString(),
    expiresInSeconds: partnerAppEmbedTokenTtlSeconds(),
    installationId: installation.id,
  };
}
