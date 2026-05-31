import Link from "next/link";

import { getTenantActor } from "@/lib/scope/cached-tenant";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function LaborReportsHubPage() {
  await getTenantActor();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Labor & shifts</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          OS Kitchen keeps an MVP layer (staff roster, tasks, POS shifts). Full payroll and compliance scheduling are
          roadmap or partner integrations — see <span className="font-medium text-foreground">docs/LABOR_STRATEGY_DECISION.md</span>.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Staff roster</CardTitle>
            <CardDescription>Roles, permissions, and coverage basics.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full">
              <Link href="/dashboard/staff">Open staff</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">POS shifts</CardTitle>
            <CardDescription>Open / close shifts, cash variance, register context.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full">
              <Link href="/dashboard/pos/shifts">Open POS shifts</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Operational tasks</CardTitle>
            <CardDescription>Kitchen and packing assignments without pretending to be payroll.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="rounded-full">
              <Link href="/dashboard/tasks">Open tasks</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Time clock</CardTitle>
            <CardDescription>Explicit roadmap — not enabled as a compliance clock in this MVP.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="outline" className="rounded-full" disabled>
              Coming in labor strategy phase
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
