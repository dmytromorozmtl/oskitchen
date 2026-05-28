import { createHash } from "crypto";

import { parseApiKeyScopesJson } from "@/lib/api-public/public-api-scopes";
import type { DeveloperApiScope } from "@/lib/developer/api-scopes";
import { prisma } from "@/lib/prisma";

export type PublicApiCredential = {
  userId: string;
  scopes: readonly DeveloperApiScope[];
};

function legacyHashApiKey(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}

function resolveApiKeyHashSalt(): string {
  return (
    process.env.API_KEY_HASH_SALT?.trim() ||
    process.env.ENCRYPTION_KEY?.trim() ||
    ""
  );
}

export function hashApiKey(raw: string): string {
  const salt = resolveApiKeyHashSalt();
  if (!salt) return legacyHashApiKey(raw);
  return createHash("sha256")
    .update("kitchenos:api-key:v1", "utf8")
    .update("\0", "utf8")
    .update(salt, "utf8")
    .update("\0", "utf8")
    .update(raw, "utf8")
    .digest("hex");
}

export function hashApiKeyCandidates(raw: string): string[] {
  const next = hashApiKey(raw);
  const legacy = legacyHashApiKey(raw);
  return next === legacy ? [next] : [next, legacy];
}

/** Returns workspace credential when the bearer API key is valid and active. */
export async function resolvePublicApiCredential(
  authHeader: string | null,
): Promise<PublicApiCredential | null> {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const raw = authHeader.slice("Bearer ".length).trim();
  if (!raw.startsWith("kos_") || raw.length < 16) return null;

  const digests = hashApiKeyCandidates(raw);
  const row = await prisma.apiKey.findFirst({
    where: { keyHash: { in: digests } },
    select: {
      id: true,
      userId: true,
      active: true,
      revokedAt: true,
      scopesJson: true,
    },
  });
  if (!row?.active || row.revokedAt) return null;

  await prisma.apiKey
    .update({
      where: { id: row.id },
      data: { lastUsedAt: new Date() },
    })
    .catch(() => undefined);

  return {
    userId: row.userId,
    scopes: parseApiKeyScopesJson(row.scopesJson),
  };
}

/** Returns workspace user id when the bearer API key is valid and active. */
export async function resolvePublicApiUserId(
  authHeader: string | null,
): Promise<string | null> {
  const credential = await resolvePublicApiCredential(authHeader);
  return credential?.userId ?? null;
}
