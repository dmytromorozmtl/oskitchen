import type { AuditLogSeverity, AuditLogSource } from "@prisma/client";

import type { AuditListFilters } from "@/lib/audit/audit-types";

const SOURCE_VALUES: AuditLogSource[] = [
  "USER",
  "SYSTEM",
  "WEBHOOK",
  "IMPORT",
  "AUTOMATION",
  "AI_COPILOT",
  "BILLING_PROVIDER",
  "SALES_CHANNEL",
  "API",
  "CRON",
  "SUPERADMIN",
];

const SEVERITY_VALUES: AuditLogSeverity[] = ["INFO", "NOTICE", "WARNING", "CRITICAL"];

function firstString(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v[0]) return v[0];
  return undefined;
}

function safeParseDate(raw: string | undefined): Date | undefined {
  if (!raw?.trim()) return undefined;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Parse dashboard audit log URL search params into filter object. */
export function parseAuditListFilters(sp: Record<string, string | string[] | undefined>): AuditListFilters {
  const tabRaw = firstString(sp.tab);
  const tab =
    tabRaw === "activity" ||
    tabRaw === "security" ||
    tabRaw === "data" ||
    tabRaw === "integrations" ||
    tabRaw === "imports" ||
    tabRaw === "billing" ||
    tabRaw === "ai" ||
    tabRaw === "exports" ||
    tabRaw === "storefront"
      ? tabRaw
      : "activity";

  const fromIso = firstString(sp.from);
  const toIso = firstString(sp.to);
  const sourceRaw = firstString(sp.source);
  const severityRaw = firstString(sp.severity);

  return {
    tab,
    action: firstString(sp.action),
    category: firstString(sp.category),
    source: SOURCE_VALUES.includes(sourceRaw as AuditLogSource) ? (sourceRaw as AuditLogSource) : undefined,
    severity: SEVERITY_VALUES.includes(severityRaw as AuditLogSeverity) ? (severityRaw as AuditLogSeverity) : undefined,
    actorUserId: firstString(sp.user),
    actorEmail: firstString(sp.email),
    entityType: firstString(sp.entityType),
    entityId: firstString(sp.entityId),
    requestId: firstString(sp.requestId),
    route: firstString(sp.route),
    keyword: firstString(sp.q),
    from: safeParseDate(fromIso),
    to: safeParseDate(toIso),
    redactionApplied: firstString(sp.redaction) === "1" ? true : undefined,
    onlyCritical: firstString(sp.critical) === "1" ? true : undefined,
    onlyFailed: firstString(sp.failed) === "1" ? true : undefined,
    workspaceId: firstString(sp.workspaceId),
  };
}
