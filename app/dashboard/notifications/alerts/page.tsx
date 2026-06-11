import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationStatusBadge } from "@/components/dashboard/notifications/status-badge";
import { listRecentInternalAlerts } from "@/services/notifications/alert-service";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import type { NotificationStatusKey } from "@/lib/notifications/notification-status";

const ALERT_CATALOG: { templateKey: string; name: string; severity: "info" | "warning" | "critical"; audience: string; module: string }[] = [
  { templateKey: "internal_new_order", name: "New order alert", severity: "info", audience: "Owners / managers", module: "Orders" },
  { templateKey: "internal_failed_webhook", name: "Failed webhook", severity: "warning", audience: "Owners / admins", module: "Channels" },
  { templateKey: "internal_unmapped_product", name: "Unmapped product", severity: "warning", audience: "Catalog managers", module: "Catalog" },
  { templateKey: "internal_production_blocker", name: "Production blocker", severity: "critical", audience: "Kitchen leads", module: "Production" },
  { templateKey: "internal_packing_issue", name: "Packing issue", severity: "warning", audience: "Kitchen leads", module: "Packing" },
  { templateKey: "internal_failed_delivery", name: "Failed delivery", severity: "critical", audience: "Drivers + dispatch", module: "Routes" },
  { templateKey: "internal_ingredient_shortage", name: "Ingredient shortage", severity: "warning", audience: "Owners / chefs", module: "Inventory" },
  { templateKey: "internal_purchase_order_overdue", name: "Purchase order overdue", severity: "info", audience: "Buyers", module: "Procurement" },
  { templateKey: "internal_go_live_blocker", name: "Go-live blocker", severity: "critical", audience: "Owners", module: "Go-live" },
  { templateKey: "internal_task_overdue", name: "Task overdue", severity: "info", audience: "Assignee + manager", module: "Tasks" },
  { templateKey: "internal_billing_issue", name: "Billing issue", severity: "critical", audience: "Owners", module: "Billing" },
];

const TONE: Record<string, string> = {
  info: "bg-sky-500/15 text-sky-900 dark:text-sky-200",
  warning: "bg-amber-500/15 text-amber-900 dark:text-amber-200",
  critical: "bg-rose-500/15 text-rose-900 dark:text-rose-200",
};

export default async function InternalAlertsPage() {
  const { userId } = await getTenantActor();
  const recent = await listRecentInternalAlerts(userId, 20);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Internal alert catalog</CardTitle>
          <CardDescription>Templates and severity for operational alerts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Alert</th>
                  <th className="px-3 py-2">Module</th>
                  <th className="px-3 py-2">Audience</th>
                  <th className="px-3 py-2">Severity</th>
                </tr>
              </thead>
              <tbody>
                {ALERT_CATALOG.map((a) => (
                  <tr key={a.templateKey} className="border-t">
                    <td className="px-3 py-2 font-medium">{a.name}</td>
                    <td className="px-3 py-2 text-muted-foreground">{a.module}</td>
                    <td className="px-3 py-2 text-muted-foreground">{a.audience}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className={`text-[10px] ${TONE[a.severity]}`}>{a.severity}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent internal alerts</CardTitle>
          <CardDescription>Last 20 internal-category notifications.</CardDescription>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No internal alerts recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-2 py-1">When</th>
                    <th className="px-2 py-1">Template</th>
                    <th className="px-2 py-1">Status</th>
                    <th className="px-2 py-1">Recipient</th>
                    <th className="px-2 py-1">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r.id} className="border-t align-top">
                      <td className="px-2 py-1 text-xs text-muted-foreground">{r.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td>
                      <td className="px-2 py-1 font-mono text-xs">{r.templateKey ?? "—"}</td>
                      <td className="px-2 py-1">
                        <NotificationStatusBadge status={(r.status ?? "QUEUED") as NotificationStatusKey} />
                      </td>
                      <td className="px-2 py-1 text-xs">{r.recipient}</td>
                      <td className="px-2 py-1 text-xs">{r.sourceType ?? "—"} {r.sourceId ? `· ${r.sourceId.slice(0, 8)}` : ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
