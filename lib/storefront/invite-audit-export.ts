/** CSV export + retention for storefront team invite audit events. */

export const STOREFRONT_INVITE_AUDIT_RETENTION_DAYS = 90;

export type InviteAuditExportRow = {
  id: string;
  createdAt: Date;
  eventType: string;
  targetEmail: string | null;
  inviteEmail: string | null;
  inviteRole: string | null;
  actorEmail: string | null;
  actorName: string | null;
  metadataJson: unknown;
};

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function inviteAuditRowsToCsv(rows: InviteAuditExportRow[]): string {
  const header = [
    "id",
    "created_at_utc",
    "event_type",
    "target_email",
    "invite_email",
    "invite_role",
    "actor_email",
    "actor_name",
    "metadata_json",
  ].join(",");

  const body = rows.map((r) =>
    [
      r.id,
      r.createdAt.toISOString(),
      r.eventType,
      r.targetEmail ?? "",
      r.inviteEmail ?? "",
      r.inviteRole ?? "",
      r.actorEmail ?? "",
      r.actorName ?? "",
      r.metadataJson != null ? JSON.stringify(r.metadataJson) : "",
    ]
      .map((c) => csvEscape(String(c)))
      .join(","),
  );

  return `${header}\n${body.join("\n")}\n`;
}
