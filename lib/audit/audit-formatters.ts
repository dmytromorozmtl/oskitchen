import type { AuditLogSeverity, AuditLogSource } from "@prisma/client";

export function formatSeverity(sev: AuditLogSeverity | null | undefined): string {
  return sev ?? "—";
}

export function formatSource(src: AuditLogSource | null | undefined): string {
  return src ?? "—";
}

export function summarizeAuditRow(input: {
  action: string;
  entityType: string;
  entityLabel?: string | null;
  entityId?: string | null;
}): string {
  const label = input.entityLabel || input.entityId || "—";
  return `${input.action} · ${input.entityType} · ${label}`;
}

export function csvEscapeCell(value: string): string {
  const v = value.replace(/\r\n/g, "\n");
  if (/^[=+\-@]/.test(v)) return `'${v.replace(/'/g, "''")}`;
  if (/[",\n]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}
