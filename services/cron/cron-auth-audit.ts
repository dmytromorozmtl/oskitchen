import { recordAuditLog } from "@/lib/audit-log";

export async function logCronAuthDenied(input: {
  slug: string | null;
  pathname: string;
  reason: "missing_secret" | "invalid_authorization";
  statusCode: 401 | 503;
}): Promise<void> {
  await recordAuditLog({
    userId: null,
    workspaceId: null,
    action: "cron.auth_denied",
    entityType: "Cron",
    metadata: {
      slug: input.slug,
      pathname: input.pathname,
      reason: input.reason,
      statusCode: input.statusCode,
    },
  });
}
