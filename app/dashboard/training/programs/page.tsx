import Link from "next/link";

import { ProgramForm } from "@/components/dashboard/training/program-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { ROLE_LABEL, DIFFICULTY_LABEL, LANGUAGE_LABEL } from "@/lib/training/training-engine";
import { listPrograms } from "@/services/training/training-service";

export default async function ProgramsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const [programs, brands, locations] = await Promise.all([
    listPrograms(dataUserId),
    prisma.brand.findMany({ where: { workspaceId: dataUserId }, select: { id: true, name: true }, orderBy: { name: "asc" } }).catch(() => []),
    prisma.location.findMany({ where: { userId: dataUserId }, select: { id: true, name: true }, orderBy: { name: "asc" } }).catch(() => []),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Training programs</h1>
        <p className="text-sm text-muted-foreground">
          Build role-based learning paths. Seed from a template to get a stage-aware curriculum instantly.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create a program</CardTitle>
          <CardDescription>Optionally seed lessons + modules from a role template.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProgramForm brands={brands} locations={locations} />
        </CardContent>
      </Card>

      {programs.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">No programs yet</CardTitle>
            <CardDescription>Use the form above to create your first program.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {programs.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-base">{p.title}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {p.isOnboardingPath ? <Badge variant="outline">Onboarding</Badge> : null}
                    {p.practiceModeOnly ? <Badge className="bg-amber-100 text-amber-700">Practice only</Badge> : null}
                  </div>
                </div>
                <CardDescription>
                  {ROLE_LABEL[p.roleType]} · {DIFFICULTY_LABEL[p.difficulty]} · {LANGUAGE_LABEL[p.language]} · {p.estimatedMinutes} min
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  Modules: <strong>{p.modules.length}</strong> · Lessons:{" "}
                  <strong>{p.modules.reduce((a, m) => a + m.lessons.length, 0)}</strong>
                </p>
                <p>Assignments: <strong>{p.assignments.length}</strong></p>
                <div className="flex gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/dashboard/training/programs/${p.id}`}>Open</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
