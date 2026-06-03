import { randomUUID } from "node:crypto";

import { test } from "@playwright/test";

import { hashApiKey } from "@/lib/api-public/auth";
import { serializeApiKeyScopes } from "@/lib/api-public/public-api-scopes";
import type { DeveloperApiScope } from "@/lib/developer/api-scopes";
import { prisma } from "@/lib/prisma";

export const hasPublicApiKeyScopeDb = Boolean(process.env.DATABASE_URL?.trim());

export type ScopedPublicApiKeyFixture = {
  rawKey: string;
  userId: string;
  workspaceId: string;
  scopes: readonly DeveloperApiScope[];
  cleanup: () => Promise<void>;
};

export function skipPublicApiKeyScopeIfNoDb(): void {
  if (!hasPublicApiKeyScopeDb) {
    test.skip(true, "Public API key scope E2E SKIPPED — missing DATABASE_URL");
  }
}

export function skipPublicApiKeyScopeHttpIfNoBaseUrl(): void {
  const base =
    process.env.PLAYWRIGHT_BASE_URL?.trim() ||
    process.env.SMOKE_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!base) {
    test.skip(
      true,
      "Public API key scope HTTP E2E SKIPPED — set PLAYWRIGHT_BASE_URL (running app required)",
    );
  }
}

function buildE2eApiKeyRaw(): string {
  return `kos_e2e_${randomUUID().replace(/-/g, "")}`;
}

export async function seedScopedPublicApiKey(
  label: string,
  scopes: readonly DeveloperApiScope[],
): Promise<ScopedPublicApiKeyFixture> {
  const suffix = `${label}-${randomUUID().slice(0, 8)}`;
  const rawKey = buildE2eApiKeyRaw();
  const owner = await prisma.userProfile.create({
    data: {
      id: randomUUID(),
      email: `public-api-scope-${suffix}@e2e.test`,
      fullName: `Public API Scope Owner ${label}`,
      role: "OWNER",
    },
  });
  const workspace = await prisma.workspace.create({
    data: {
      name: `Public API Scope WS ${suffix}`,
      ownerUserId: owner.id,
    },
  });
  await prisma.apiKey.create({
    data: {
      userId: owner.id,
      workspaceId: workspace.id,
      name: `E2E scope ${label}`,
      keyHash: hashApiKey(rawKey),
      prefix: rawKey.slice(0, 12),
      scopesJson: serializeApiKeyScopes(scopes),
      active: true,
    },
  });

  return {
    rawKey,
    userId: owner.id,
    workspaceId: workspace.id,
    scopes,
    cleanup: async () => {
      await prisma.apiKey.deleteMany({ where: { userId: owner.id } }).catch(() => undefined);
      await prisma.workspace.delete({ where: { id: workspace.id } }).catch(() => undefined);
      await prisma.userProfile.delete({ where: { id: owner.id } }).catch(() => undefined);
    },
  };
}
