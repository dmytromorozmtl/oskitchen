import { createPlatformIncidentAction } from "@/actions/developer-platform";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { INCIDENT_SEVERITIES, INCIDENT_STATUSES } from "@/lib/developer/incident-severity";
import { requireDeveloperCenterAccess } from "@/lib/developer/developer-permissions";
import { listPlatformIncidents } from "@/services/developer/incident-service";
import { formatDistanceToNow } from "date-fns";

export default async function DeveloperIncidentsPage() {
  const ctx = await requireDeveloperCenterAccess();
  const incidents = await listPlatformIncidents(ctx.userId, ctx.platformSuper);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Incidents</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Internal incident log stored in the audit trail — tenant scoped unless you are platform superadmin.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create incident</CardTitle>
          <CardDescription>Creates an auditable record — no customer PII in notes.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createPlatformIncidentAction} className="grid max-w-xl gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required placeholder="Stripe webhook delays" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <select
                  id="severity"
                  name="severity"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue="medium"
                >
                  {INCIDENT_SEVERITIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  defaultValue="investigating"
                >
                  {INCIDENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="affectedSystems">Affected systems (comma-separated)</Label>
              <Input id="affectedSystems" name="affectedSystems" placeholder="stripe, resend, imports" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mitigation">Mitigation / customer messaging</Label>
              <Textarea id="mitigation" name="mitigation" rows={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <select
                id="visibility"
                name="visibility"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                defaultValue="internal"
              >
                <option value="internal">Internal</option>
                <option value="public">Public</option>
              </select>
            </div>
            <Button type="submit" className="w-fit rounded-full">
              Record incident
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent incidents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {incidents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active incidents.</p>
          ) : (
            incidents.map((i) => (
              <div key={i.id} className="rounded-xl border border-border/70 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{i.title}</p>
                  <Badge variant="outline" className="capitalize">
                    {i.severity}
                  </Badge>
                  <Badge variant="secondary" className="capitalize">
                    {i.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(i.createdAt, { addSuffix: true })}
                  </span>
                </div>
                {i.affectedSystems.length ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Systems: {i.affectedSystems.join(", ")}
                  </p>
                ) : null}
                {i.mitigation ? <p className="mt-2 text-sm">{i.mitigation}</p> : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
