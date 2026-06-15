import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  extractScimBearerToken,
  hashScimBearerToken,
  verifyScimBearerToken,
} from "@/lib/scim/scim-token";

export type ScimAuthContext = {
  workspaceId: string;
  pilotPhase: string;
};

export type ScimAuthResult =
  | { ok: true; context: ScimAuthContext }
  | { ok: false; status: 401; detail: string };

/** Resolve workspace from Bearer token (DB settings or pilot env fallback). */
export async function authenticateScimRequest(
  authHeader: string | null,
): Promise<ScimAuthResult> {
  const token = extractScimBearerToken(authHeader);
  if (!token) {
    return { ok: false, status: 401, detail: "Missing or invalid Bearer token" };
  }

  const pilotWorkspaceId = process.env.SCIM_PILOT_WORKSPACE_ID?.trim();
  const pilotToken = process.env.SCIM_PILOT_BEARER_TOKEN?.trim();
  if (
    pilotWorkspaceId &&
    pilotToken &&
    verifyScimBearerToken(token, hashScimBearerToken(pilotToken))
  ) {
    return {
      ok: true,
      context: { workspaceId: pilotWorkspaceId, pilotPhase: "PILOT_ACTIVE" },
    };
  }

  const tokenHash = hashScimBearerToken(token);
  let settings: {
    workspaceId: string;
    enabled: boolean;
    pilotPhase: string;
  } | null = null;

  try {
    settings = await prisma.workspaceScimSettings.findFirst({
      where: { tokenHash, enabled: true },
      select: { workspaceId: true, enabled: true, pilotPhase: true },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021"
    ) {
      return {
        ok: false,
        status: 401,
        detail: "SCIM provisioning is not configured",
      };
    }
    throw error;
  }

  if (!settings) {
    return { ok: false, status: 401, detail: "Invalid SCIM bearer token" };
  }

  if (
    settings.pilotPhase !== "PILOT_CONFIGURED" &&
    settings.pilotPhase !== "PILOT_ACTIVE"
  ) {
    return { ok: false, status: 401, detail: "SCIM pilot is not active" };
  }

  return {
    ok: true,
    context: {
      workspaceId: settings.workspaceId,
      pilotPhase: settings.pilotPhase,
    },
  };
}
