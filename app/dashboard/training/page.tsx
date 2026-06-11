import Link from "next/link";

import { ProgramForm } from "@/components/dashboard/training/program-form";
import { TrainingKpiGrid } from "@/components/dashboard/training/kpi-grid";
import { AssignmentStatusBadge } from "@/components/dashboard/training/status-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTrainingPageAccess } from "@/lib/training/training-page-access";
import { prisma } from "@/lib/prisma";
import { ROLE_LABEL } from "@/lib/training/training-engine";
import {
  listAssignments,
  listPrograms,
  trainingKpis,
} from "@/services/training/training-service";

const LEGACY_TILES = [
  { title: "Kitchen staff (legacy)", href: "/dashboard/training/kitchen", desc: "Production board, kitchen screen, batch quantities." },
  { title: "Packing staff (legacy)", href: "/dashboard/training/packing", desc: "Packing verification, labels, exceptions." },
  { title: "Manager (legacy)", href: "/dashboard/training/manager", desc: "Order hub, menu planner, reports, issue triage." },
] as const;

export default async function TrainingPage() {
  const access = await getTrainingPageAccess();
  const { userId } = access;
  const [kpis, programs, assignments, brands, locations] = await Promise.all([
    trainingKpis(userId),
    listPrograms(userId),
    listAssignments(userId),
    prisma.brand.findMany({
      where: { workspaceId: userId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      take: 50,
    }).catch(() => []),
    prisma.location.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      take: 50,
    }).catch(() => []),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Staff Training Command Center</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Operational onboarding, certifications, simulations, and SOP training for restaurants, cafés,
            bakeries, catering, meal prep, and ghost kitchens.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild>
            <Link href="/dashboard/training/programs">Assign training</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/training/simulations">Launch simulation</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/training/sops">Create SOP</Link>
          </Button>
          {access.actor.platformBypass ? <Badge variant="outline">Superadmin</Badge> : null}
        </div>
      </div>

      <TrainingKpiGrid tiles={kpis} />

      {programs.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">No training programs yet</CardTitle>
            <CardDescription>
              Build structured onboarding, SOP learning, and operational simulations for your team. Seed a
              role-based template to get started in a minute.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProgramForm brands={brands} locations={locations} />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {programs.slice(0, 6).map((program) => {
            const total = program.assignments.length;
            const completed = program.assignments.filter((a) => a.status === "COMPLETED").length;
            return (
              <Card key={program.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">{program.title}</CardTitle>
                    {program.isOnboardingPath ? <Badge variant="outline">Onboarding</Badge> : null}
                  </div>
                  <CardDescription>
                    {ROLE_LABEL[program.roleType]} · {program.difficulty} · {program.estimatedMinutes} min
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p className="text-muted-foreground">{program.description}</p>
                  <p>
                    <strong>{program.modules.length}</strong> modules ·{" "}
                    <strong>{program.modules.reduce((a, m) => a + m.lessons.length, 0)}</strong> lessons
                  </p>
                  <p>
                    Assignments: <strong>{total}</strong> · Completed: <strong>{completed}</strong>
                  </p>
                  <div className="pt-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/training/programs/${program.id}`}>Open</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent assignments</CardTitle>
          <CardDescription>Last 10 assignments across all programs.</CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assignments yet.</p>
          ) : (
            <ul className="space-y-2">
              {assignments.slice(0, 10).map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2 text-sm">
                  <div>
                    <p className="font-medium">{a.program.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Trainee:{" "}
                      {a.assignedTo?.fullName ?? a.assignedTo?.email ??
                        a.assignedToStaff?.name ??
                        a.assignedToName ??
                        a.assignedToEmail ??
                        "—"}
                      {a.practiceMode ? " · Practice" : ""}
                      {a.dueAt ? ` · Due ${a.dueAt.toISOString().slice(0, 10)}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{a.completionPercent}%</span>
                    <AssignmentStatusBadge status={a.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Legacy walkthroughs</CardTitle>
          <CardDescription>
            The original three role walkthroughs are still available for quick reference.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {LEGACY_TILES.map((t) => (
              <div key={t.href} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={t.href}>Open</Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
