"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { integrationConnectionByIdWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import {
  certificationSignOffComplete,
  parseCertificationRecord,
  type CertificationSignOff,
} from "@/lib/integrations/channel-certification-types";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import {
  persistCertificationRecord,
  runChannelCertification,
} from "@/services/integrations/channel-certification-runner";
import { IntegrationProvider, UserRole } from "@prisma/client";

const connectionSchema = z.object({
  connectionId: z.string().uuid(),
});

const signOffSchema = z.object({
  connectionId: z.string().uuid(),
  role: z.enum(["engineering", "security", "pilot"]),
  notes: z.string().max(2000).optional(),
});

export async function runChannelCertificationAction(
  formData: FormData,
): Promise<{ ok: true; overall: string } | { error: string }> {
  try {
    const { userId } = await requireTenantActor();
    const parsed = connectionSchema.safeParse({
      connectionId: formData.get("connectionId"),
    });
    if (!parsed.success) return { error: "Invalid connection." };

    const conn = await prisma.integrationConnection.findFirst({
      where: {
        AND: [
          await integrationConnectionByIdWhereForOwner(userId, parsed.data.connectionId),
          { provider: { in: [IntegrationProvider.WOOCOMMERCE, IntegrationProvider.SHOPIFY] } },
        ],
      },
    });
    if (!conn) return { error: "Connection not found." };

    const record = await runChannelCertification(conn);
    await persistCertificationRecord(conn.id, record, conn.settingsJson);

    revalidatePath("/dashboard/integrations/woocommerce");
    revalidatePath("/dashboard/integrations/shopify");
    revalidatePath("/dashboard/integrations/health");
    revalidatePath("/dashboard/sales-channels/health");

    return { ok: true as const, overall: record.overall };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function recordCertificationSignOffAction(
  formData: FormData,
): Promise<{ ok: true } | { error: string }> {
  try {
    const { sessionUser, userId } = await requireTenantActor();
    const profile = await prisma.userProfile.findUnique({
      where: { id: sessionUser.id },
      select: { role: true },
    });
    if (profile?.role !== UserRole.OWNER) {
      return { error: "Only the workspace owner can record certification sign-off." };
    }

    const parsed = signOffSchema.safeParse({
      connectionId: formData.get("connectionId"),
      role: formData.get("role"),
      notes: formData.get("notes") ?? undefined,
    });
    if (!parsed.success) return { error: "Invalid sign-off." };

    const conn = await prisma.integrationConnection.findFirst({
      where: {
        AND: [
          await integrationConnectionByIdWhereForOwner(userId, parsed.data.connectionId),
          { provider: { in: [IntegrationProvider.WOOCOMMERCE, IntegrationProvider.SHOPIFY] } },
        ],
      },
    });
    if (!conn) return { error: "Connection not found." };

    const existing = parseCertificationRecord(conn.settingsJson);
    if (!existing || existing.overall === "FAIL") {
      return { error: "Run certification first — overall must not be FAIL." };
    }

    const now = new Date().toISOString();
    const signOff: CertificationSignOff = { ...existing.signOff };
    if (parsed.data.role === "engineering") signOff.engineeringAt = now;
    if (parsed.data.role === "security") signOff.securityAt = now;
    if (parsed.data.role === "pilot") signOff.pilotAt = now;
    if (parsed.data.notes?.trim()) {
      signOff.notes = parsed.data.notes.trim();
    }

    const productStatus = certificationSignOffComplete(signOff)
      ? "PILOT_SIGNED"
      : "BETA";

    await persistCertificationRecord(
      conn.id,
      { ...existing, signOff, productStatus },
      conn.settingsJson,
    );

    revalidatePath("/dashboard/integrations/woocommerce");
    revalidatePath("/dashboard/integrations/shopify");
    revalidatePath("/dashboard/integrations/health");

    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}
