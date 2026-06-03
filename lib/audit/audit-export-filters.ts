import type { AuditLogSource, AuditLogSeverity } from "@prisma/client";

import type { AuditListFilters } from "@/lib/audit/audit-types";

function parseDateParam(value: string | null): Date | undefined {
  if (!value?.trim()) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Parse audit export query string into list filters (mirrors audit-logs page params). */
export function parseAuditExportSearchParams(
  params: URLSearchParams,
): AuditListFilters {
  const tab = params.get("tab");
  const validTabs = new Set([
    "activity",
    "security",
    "data",
    "integrations",
    "imports",
    "billing",
    "ai",
    "exports",
    "storefront",
    "all",
  ]);

  const source = params.get("source")?.trim();
  const severity = params.get("severity")?.trim();

  return {
    workspaceId: params.get("workspaceId")?.trim() || undefined,
    from: parseDateParam(params.get("from")),
    to: parseDateParam(params.get("to")),
    action: params.get("action")?.trim() || undefined,
    category: params.get("category")?.trim() || undefined,
    source: source ? (source as AuditLogSource) : undefined,
    severity: severity ? (severity as AuditLogSeverity) : undefined,
    actorUserId: params.get("user")?.trim() || undefined,
    actorEmail: params.get("email")?.trim() || undefined,
    entityType: params.get("entityType")?.trim() || undefined,
    entityId: params.get("entityId")?.trim() || undefined,
    requestId: params.get("requestId")?.trim() || undefined,
    route: params.get("route")?.trim() || undefined,
    keyword: params.get("q")?.trim() || undefined,
    redactionApplied: params.get("redaction") === "1" ? true : undefined,
    onlyCritical: params.get("critical") === "1" ? true : undefined,
    onlyFailed: params.get("failed") === "1" ? true : undefined,
    tab:
      tab && validTabs.has(tab)
        ? (tab as AuditListFilters["tab"])
        : undefined,
  };
}

export function buildAuditExportDownloadHref(input: {
  filters: AuditListFilters;
  format: "csv" | "json";
  signed?: boolean;
}): string {
  const params = new URLSearchParams();
  params.set("format", input.format);
  if (input.signed) params.set("signed", "1");

  const f = input.filters;
  if (f.tab && f.tab !== "activity") params.set("tab", f.tab);
  if (f.action) params.set("action", f.action);
  if (f.category) params.set("category", f.category);
  if (f.source) params.set("source", f.source);
  if (f.severity) params.set("severity", f.severity);
  if (f.actorUserId) params.set("user", f.actorUserId);
  if (f.actorEmail) params.set("email", f.actorEmail);
  if (f.entityType) params.set("entityType", f.entityType);
  if (f.entityId) params.set("entityId", f.entityId);
  if (f.requestId) params.set("requestId", f.requestId);
  if (f.route) params.set("route", f.route);
  if (f.keyword) params.set("q", f.keyword);
  if (f.from) params.set("from", f.from.toISOString());
  if (f.to) params.set("to", f.to.toISOString());
  if (f.redactionApplied) params.set("redaction", "1");
  if (f.onlyCritical) params.set("critical", "1");
  if (f.onlyFailed) params.set("failed", "1");
  if (f.workspaceId) params.set("workspaceId", f.workspaceId);

  const q = params.toString();
  return q
    ? `/api/dashboard/audit-logs/export?${q}`
    : "/api/dashboard/audit-logs/export";
}
