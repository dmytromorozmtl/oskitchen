import type { ChannelCredentialAuditAction } from "@prisma/client";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import {
  decryptOptional,
  encryptOptional,
  EncryptionKeyMissingError,
  isEncryptionConfigured,
} from "@/lib/crypto";

export { decryptOptional, encryptOptional, isEncryptionConfigured, EncryptionKeyMissingError };

/** Mask a secret for display — never send ciphertext to the browser. */
export function maskSecret(plain: string | null | undefined, visible = 4): string {
  if (plain == null || plain === "") return "";
  const t = plain.trim();
  if (t.length <= visible * 2) return "••••••••";
  return `${t.slice(0, visible)}…${t.slice(-visible)}`;
}

export async function logChannelCredentialAudit(input: {
  connectionId: string;
  userId: string;
  performedBy: string;
  action: ChannelCredentialAuditAction;
  /** Must never contain raw secrets or ciphertext. */
  metadata?: Record<string, unknown> | null;
}): Promise<void> {
  try {
    await prisma.channelCredentialAudit.create({
      data: {
        connectionId: input.connectionId,
        userId: input.userId,
        performedBy: input.performedBy,
        action: input.action,
        metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch {
    /* audit must not block primary flow */
  }
}
