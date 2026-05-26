import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProviderModeBadge } from "@/components/dashboard/notifications/status-badge";
import { getResendDiagnostics } from "@/lib/notifications/provider-resend";
import { getTenantActor } from "@/lib/scope/cached-tenant";

const STATUS_LABEL: Record<string, string> = {
  present: "Present",
  missing: "Missing",
  optional: "Optional",
  warning: "Warning",
};

const STATUS_TONE: Record<string, string> = {
  present: "bg-emerald-500/15 text-emerald-900 dark:text-emerald-200",
  missing: "bg-rose-500/15 text-rose-900 dark:text-rose-200",
  optional: "bg-muted text-foreground",
  warning: "bg-amber-500/15 text-amber-900 dark:text-amber-200",
};

export default async function ProviderPage() {
  await getTenantActor();
  const d = getResendDiagnostics();
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resend</CardTitle>
          <CardDescription>
            Presence-only diagnostics. The API key value is never returned by the server.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span>Mode:</span>
            <ProviderModeBadge mode={d.mode} />
            <span className="ml-4">From:</span>
            <span className="font-mono text-xs text-muted-foreground">{d.fromAddress ?? "—"}</span>
          </div>
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Env var</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Hint</th>
                </tr>
              </thead>
              <tbody>
                {d.rows.map((row) => (
                  <tr key={row.key} className="border-t">
                    <td className="px-3 py-2 font-mono text-xs">{row.key}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className={`text-[10px] ${STATUS_TONE[row.status]}`}>
                        {STATUS_LABEL[row.status]}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{row.hint ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Webhook delivery status</CardTitle>
          <CardDescription>Resend posts delivery / bounce / complaint events to <code className="rounded bg-muted px-1 text-xs">/api/webhooks/resend</code> when configured.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {d.webhookEnabled
            ? "Webhook secret detected — incoming events will update logs and create NotificationEvent rows."
            : "Webhook secret not configured — delivery status is unavailable. Set RESEND_WEBHOOK_SECRET to enable status updates."}
        </CardContent>
      </Card>
    </div>
  );
}
