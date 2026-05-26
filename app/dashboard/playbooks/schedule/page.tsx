import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { listPlaybooks } from "@/services/playbooks/playbook-service";

const TRIGGER_LABEL: Record<string, string> = {
  MANUAL: "Run when needed",
  DAILY: "Daily",
  WEEKLY: "Weekly",
  EVENT_DATE: "Event-driven",
  MENU_CUTOFF: "After menu cutoff",
  PRODUCTION_DATE: "Per production date",
  ORDER_VOLUME: "When volume spikes",
  INCIDENT: "On incident",
};

export default async function PlaybookSchedulePage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const scope = { userId: dataUserId, email: user.email ?? null };
  const playbooks = await listPlaybooks(scope, {});

  const recurring = playbooks.filter(
    (p) => p.triggerType !== "MANUAL" && p.active,
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Schedule / Recurring</h1>
        <p className="text-muted-foreground">
          Playbooks that recommend recurrence. Runs are <strong>never</strong> auto-created —
          owners decide when to start them.
        </p>
      </div>
      {recurring.length === 0 ? (
        <Card className="border-dashed border-border/80 bg-muted/10 shadow-none">
          <CardHeader>
            <CardTitle className="text-base">No recurring playbooks</CardTitle>
            <CardDescription>
              Edit a playbook to add a recurrence rule (FREQ=DAILY, FREQ=WEEKLY, …).
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {recurring.map((p) => (
            <Card key={p.id} className="border-border/80 bg-card/90 shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{p.title}</CardTitle>
                  <Badge variant="secondary" className="rounded-full text-xs">
                    {TRIGGER_LABEL[p.triggerType] ?? p.triggerType}
                  </Badge>
                </div>
                <CardDescription>{p.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {p.recurrenceRule ? `Rule: ${p.recurrenceRule}` : "No RRULE configured"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
