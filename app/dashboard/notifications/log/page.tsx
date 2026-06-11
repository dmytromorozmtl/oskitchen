import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationStatusBadge } from "@/components/dashboard/notifications/status-badge";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import type { NotificationStatusKey } from "@/lib/notifications/notification-status";

export default async function NotificationLogPage() {
  const { userId } = await getTenantActor();
  const logs = await prisma.notificationLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Notification log</CardTitle>
        <CardDescription>Last 200 notifications. Use Retry tab to act on failures.</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">No notifications sent yet</p>
            <p className="mt-1 text-xs">Sent, skipped, failed, and retried notifications will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-2 py-1">When</th>
                  <th className="px-2 py-1">Status</th>
                  <th className="px-2 py-1">Template</th>
                  <th className="px-2 py-1">Recipient</th>
                  <th className="px-2 py-1">Category</th>
                  <th className="px-2 py-1">Trigger</th>
                  <th className="px-2 py-1">Provider</th>
                  <th className="px-2 py-1">Retry</th>
                  <th className="px-2 py-1">Reason</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((row) => (
                  <tr key={row.id} className="border-t align-top">
                    <td className="px-2 py-1 text-xs text-muted-foreground whitespace-nowrap">
                      {row.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                    </td>
                    <td className="px-2 py-1">
                      <NotificationStatusBadge status={(row.status ?? (row.type ? "SENT" : "QUEUED")) as NotificationStatusKey} />
                    </td>
                    <td className="px-2 py-1 font-mono text-xs">{row.templateKey ?? "—"}</td>
                    <td className="px-2 py-1 max-w-[180px] truncate text-xs">{row.recipient}</td>
                    <td className="px-2 py-1 text-xs">{row.category ?? "—"}</td>
                    <td className="px-2 py-1 text-xs">{row.triggerType ?? "—"}</td>
                    <td className="px-2 py-1 text-xs">{row.provider ?? "—"}</td>
                    <td className="px-2 py-1 text-xs">{row.retryCount}</td>
                    <td className="px-2 py-1 max-w-[220px] truncate text-xs text-muted-foreground">{row.errorMessage ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
