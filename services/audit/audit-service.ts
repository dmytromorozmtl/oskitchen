import { createHash } from "crypto";

import type { AuditLogSeverity, Prisma } from "@prisma/client";

import type { AuditLogInput } from "@/lib/audit/audit-types";
import { redactMetadataForPolicy, redactUnknown } from "@/lib/audit/audit-redaction";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

function hashValue(raw: string | null | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  const salt = process.env.AUDIT_HASH_SALT ?? "kitchenos-audit-v1";
  return createHash("sha256").update(salt + "|" + raw).digest("hex").slice(0, 64);
}

function shallowDiff(before: unknown, after: unknown): Record<string, { before?: unknown; after?: unknown }> | null {
  if (before === null || before === undefined || after === null || after === undefined) return null;
  if (typeof before !== "object" || typeof after !== "object" || Array.isArray(before) || Array.isArray(after)) {
    return null;
  }
  const out: Record<string, { before?: unknown; after?: unknown }> = {};
  const bk = before as Record<string, unknown>;
  const ak = after as Record<string, unknown>;
  const keys = new Set([...Object.keys(bk), ...Object.keys(ak)]);
  for (const k of keys) {
    const a = bk[k];
    const b = ak[k];
    if (JSON.stringify(a) !== JSON.stringify(b)) out[k] = { before: a, after: b };
  }
  return Object.keys(out).length ? out : null;
}

export async function resolveWorkspaceIdForOwner(userId: string): Promise<string | null> {
  const ws = await prisma.workspace.findFirst({
    where: { ownerUserId: userId },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });
  return ws?.id ?? null;
}

/**
 * Central audit writer — server-side only. Never throws to callers; logs failures internally.
 */
export async function auditLog(input: AuditLogInput): Promise<void> {
  try {
    let workspaceId = input.workspaceId ?? null;
    if (!workspaceId && input.actor.userId) {
      workspaceId = await resolveWorkspaceIdForOwner(input.actor.userId);
    }

    const rb = input.before !== undefined ? redactUnknown(input.before) : null;
    const ra = input.after !== undefined ? redactUnknown(input.after) : null;
    const rm = redactMetadataForPolicy(input.metadata, {
      maskEmail: Boolean(input.maskPiiInMetadata),
      maskPhone: Boolean(input.maskPiiInMetadata),
    });

    const redactionApplied = Boolean(rb?.redactionApplied || ra?.redactionApplied || rm.redactionApplied);
    const diff = rb?.value !== undefined && ra?.value !== undefined ? shallowDiff(rb.value, ra.value) : null;
    const diffRedacted = diff ? redactUnknown(diff) : null;

    await prisma.auditLog.create({
      data: {
        organizationId: input.organizationId ?? null,
        workspaceId,
        userId: input.actor.userId ?? null,
        actorStaffId: input.actor.staffId ?? null,
        actorEmail: input.actor.email ?? null,
        actorRole: input.actor.role ?? null,
        action: input.action.slice(0, 120),
        category: (input.category as string).slice(0, 40),
        severity: input.severity ?? "INFO",
        source: input.source,
        entityType: input.entity.type.slice(0, 120),
        entityId: input.entity.id?.slice(0, 255) ?? null,
        entityLabel: input.entity.label?.slice(0, 500) ?? null,
        route: input.request?.route?.slice(0, 512) ?? null,
        method: input.request?.method?.slice(0, 16) ?? null,
        ipHash: hashValue(input.request?.ip ?? null),
        userAgentHash: hashValue(input.request?.userAgent ?? null),
        requestId: input.request?.requestId?.slice(0, 80) ?? null,
        beforeJson: rb ? (rb.value as Prisma.InputJsonValue) : undefined,
        afterJson: ra ? (ra.value as Prisma.InputJsonValue) : undefined,
        diffJson: diffRedacted?.value ? (diffRedacted.value as Prisma.InputJsonValue) : undefined,
        metadataJson: rm.value ? (rm.value as Prisma.InputJsonValue) : undefined,
        redactionApplied,
        ipAddress: null,
        userAgent: null,
      },
    });

    if (input.entity.type === "storefront_settings" && input.entity.id) {
      const { appendStorefrontExperimentAuditEvent } = await import(
        "@/services/storefront/storefront-experiment-audit-stream"
      );
      const meta =
        rm.value && typeof rm.value === "object" && !Array.isArray(rm.value)
          ? (rm.value as Record<string, unknown>)
          : null;
      void appendStorefrontExperimentAuditEvent({
        storefrontId: input.entity.id,
        action: input.action,
        severity: input.severity ?? "INFO",
        source: input.source,
        actorEmail: input.actor.email ?? null,
        metadata: meta,
      });
    }
  } catch (e) {
    logger.error("auditLog write failed", e);
  }
}

/** Map legacy recordAuditLog calls into the central taxonomy. */
export async function auditLogLegacyCompat(input: {
  organizationId?: string | null;
  workspaceId?: string | null;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  const meta =
    input.metadata && typeof input.metadata === "object" && !Array.isArray(input.metadata)
      ? (input.metadata as Record<string, unknown>)
      : undefined;
  await auditLog({
    organizationId: input.organizationId,
    workspaceId: input.workspaceId,
    actor: { userId: input.userId },
    action: input.action,
    category: inferCategory(input.action, input.entityType),
    source: "USER",
    severity: "INFO" as AuditLogSeverity,
    entity: { type: input.entityType, id: input.entityId ?? null },
    metadata: meta,
    request: {
      ip: input.ipAddress ?? undefined,
      userAgent: input.userAgent ?? undefined,
    },
  });
}

function inferCategory(action: string, entityType: string): string {
  const a = action.toLowerCase();
  const e = entityType.toLowerCase();
  if (a.includes("settings") || e.includes("settings")) return "SETTINGS";
  if (a.includes("staff") || e.includes("staff")) return "STAFF";
  if (a.includes("order") || e.includes("order")) return "ORDERS";
  if (a.includes("import") || e.includes("import")) return "IMPORT_EXPORT";
  if (a.includes("billing") || a.includes("stripe") || e.includes("subscription")) return "BILLING";
  if (a.includes("platform.") || a.startsWith("platform")) return "PLATFORM";
  if (a.includes("developer") || e.includes("platform_incident")) return "DEVELOPER";
  if (a.includes("webhook")) return "WEBHOOKS";
  if (a.includes("menu") || e.includes("menu")) return "MENUS";
  if (a.includes("customer") || e.includes("customer")) return "CUSTOMERS";
  if (a.includes("brand")) return "PRODUCTS";
  if (e.includes("production")) return "PRODUCTION";
  if (e.includes("pack")) return "PACKING";
  return "SYSTEM";
}
