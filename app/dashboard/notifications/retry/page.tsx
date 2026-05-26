import { CancelButton, RetryButton } from "@/components/dashboard/notifications/retry-button";
import { NotificationStatusBadge } from "@/components/dashboard/notifications/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { canSendEmails } from "@/lib/notifications/provider-resend";
import { canUseNotifications } from "@/lib/notifications/notification-permissions";
import { requireUserProfile } from "@/lib/auth";
import { getTenantActor } from "@/lib/scope/cached-tenant";

import { prisma } from "@/lib/prisma";
import type { NotificationStatusKey } from "@/lib/notifications/notification-status";

export default async function RetryPage() {
  const { userId } = await getTenantActor();
  const profile = await requireUserProfile();
  const actor = { userId, email: profile.email ?? null, role: profile.role ?? null };
  const canRetry = canUseNotifications(actor, "retry_failed");
  const sendingEnabled = canSendEmails();

  const failed = await prisma.notificationLog.findMany({
    where: { userId, status: { in: ["FAILED", "RETRYING"] } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const queued = await prisma.notificationLog.findMany({
    where: { userId, status: "QUEUED" },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Failed / retrying</CardTitle>
          <CardDescription>
            Max 5 retry attempts per notification. Retries require a valid template, recipient, and
            an enabled provider.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {failed.length === 0 ? (
            <p className="text-sm text-muted-foreground">No failures right now.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-2 py-1">When</th>
                  <th className="px-2 py-1">Template</th>
                  <th className="px-2 py-1">Recipient</th>
                  <th className="px-2 py-1">Attempts</th>
                  <th className="px-2 py-1">Reason</th>
                  <th className="px-2 py-1">Action</th>
                </tr>
              </thead>
              <tbody>
                {failed.map((row) => (
                  <tr key={row.id} className="border-t align-top">
                    <td className="px-2 py-1 text-xs text-muted-foreground">{row.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td>
                    <td className="px-2 py-1 font-mono text-xs">{row.templateKey ?? "—"}</td>
                    <td className="px-2 py-1 text-xs">{row.recipient}</td>
                    <td className="px-2 py-1 text-xs">{row.retryCount}</td>
                    <td className="px-2 py-1 max-w-[260px] truncate text-xs text-muted-foreground">{row.errorMessage ?? ""}</td>
                    <td className="px-2 py-1">
                      <RetryButton logId={row.id} disabled={!canRetry || !sendingEnabled || row.retryCount >= 5 || !row.templateKey} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Queued</CardTitle>
          <CardDescription>Notifications waiting for a worker. Cancel from here if needed.</CardDescription>
        </CardHeader>
        <CardContent>
          {queued.length === 0 ? (
            <p className="text-sm text-muted-foreground">No queued notifications.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-2 py-1">When</th>
                  <th className="px-2 py-1">Template</th>
                  <th className="px-2 py-1">Recipient</th>
                  <th className="px-2 py-1">Status</th>
                  <th className="px-2 py-1">Action</th>
                </tr>
              </thead>
              <tbody>
                {queued.map((row) => (
                  <tr key={row.id} className="border-t align-top">
                    <td className="px-2 py-1 text-xs text-muted-foreground">{row.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td>
                    <td className="px-2 py-1 font-mono text-xs">{row.templateKey ?? "—"}</td>
                    <td className="px-2 py-1 text-xs">{row.recipient}</td>
                    <td className="px-2 py-1">
                      <NotificationStatusBadge status={(row.status ?? "QUEUED") as NotificationStatusKey} />
                    </td>
                    <td className="px-2 py-1">{canRetry ? <CancelButton logId={row.id} /> : null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
