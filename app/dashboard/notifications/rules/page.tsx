import Link from "next/link";

import { InstallDefaultsButton, RuleRowControls } from "@/components/dashboard/notifications/rule-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { canUseNotifications } from "@/lib/notifications/notification-permissions";
import { getNotificationActorScope } from "@/lib/notifications/notification-actor-scope";
import { listRulesForWorkspace } from "@/services/notifications/reminder-service";

export default async function NotificationRulesPage() {
  const actor = await getNotificationActorScope();
  const canManage = canUseNotifications(actor, "manage_rules");

  const rules = await listRulesForWorkspace(actor.userId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Reminder rules</CardTitle>
            <CardDescription>
              Bind triggers to templates and timing offsets. The legacy `kitchen_settings` toggles
              remain the master on/off switch.
            </CardDescription>
          </div>
          {canManage ? <InstallDefaultsButton /> : null}
        </CardHeader>
      </Card>

      {rules.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">No reminder rules yet</CardTitle>
            <CardDescription>
              Create rules for pickup reminders, delivery reminders, preorder deadlines, and
              internal operational alerts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {canManage ? <InstallDefaultsButton /> : <p className="text-sm text-muted-foreground">Ask an owner / admin / manager to install defaults.</p>}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rules.map((r) => (
            <Card key={r.id}>
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-sm flex flex-wrap items-center gap-2">
                    {r.ruleKey}
                    <Badge variant="outline" className="text-[10px]">{r.category}</Badge>
                    <Badge variant="outline" className="text-[10px]">{r.channel}</Badge>
                    <Badge variant="outline" className="text-[10px]">{r.audience}</Badge>
                    {!r.enabled ? <Badge variant="outline" className="text-[10px] bg-muted">disabled</Badge> : null}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {r.description ?? "Custom rule"} · template <code className="rounded bg-muted px-1">{r.templateKey}</code> · trigger {r.triggerKey}
                  </CardDescription>
                </div>
                {canManage ? (
                  <RuleRowControls
                    id={r.id}
                    enabled={r.enabled}
                    offsetMinutes={r.offsetMinutes}
                    dedupeWindowMinutes={r.dedupeWindowMinutes}
                  />
                ) : null}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Master on/off toggles for transactional categories live under{" "}
        <Link href="/dashboard/settings" className="text-primary hover:underline">Settings</Link>.
      </p>
    </div>
  );
}
