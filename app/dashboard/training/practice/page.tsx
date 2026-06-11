import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { listAssignments } from "@/services/training/training-service";

export default async function PracticePage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const assignments = (await listAssignments(dataUserId)).filter((a) => a.practiceMode);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Practice mode</h1>
        <Badge className="bg-amber-100 text-amber-700">Sandbox · no production writes</Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Practice mode keeps simulations and lesson progress isolated from production data. Fake orders,
        routes, labels, and inventory movements are surfaced to trainees through the legacy walkthroughs
        and simulations — none of them write to live systems.
      </p>

      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kitchen walkthrough</CardTitle>
            <CardDescription>Production board, kitchen screen, batch quantities.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/training/kitchen">Open</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Packing walkthrough</CardTitle>
            <CardDescription>Packing verification, labels, exceptions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/training/packing">Open</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Manager walkthrough</CardTitle>
            <CardDescription>Order hub, menu planner, reports, issue triage.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/training/manager">Open</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Practice assignments</CardTitle>
          <CardDescription>{assignments.length} practice assignment{assignments.length === 1 ? "" : "s"}.</CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No practice assignments yet.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {assignments.map((a) => (
                <li key={a.id} className="flex items-center justify-between rounded-md border p-2">
                  <span>{a.program.title}</span>
                  <span className="text-xs text-muted-foreground">{a.completionPercent}%</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conversion to certification</CardTitle>
          <CardDescription>
            A manager must explicitly issue a certification from the Certifications tab once a practice
            program is complete. Practice runs are never auto-promoted to live.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild size="sm">
            <Link href="/dashboard/training/certifications">Go to certifications</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
