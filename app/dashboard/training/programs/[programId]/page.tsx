import { notFound } from "next/navigation";

import { AssignProgramForm } from "@/components/dashboard/training/assign-form";
import { AssignmentStatusBadge } from "@/components/dashboard/training/status-badges";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTrainingPageAccess } from "@/lib/training/training-page-access";
import { prisma } from "@/lib/prisma";
import { DIFFICULTY_LABEL, LANGUAGE_LABEL, ROLE_LABEL } from "@/lib/training/training-engine";
import { getProgram } from "@/services/training/training-service";

type PageProps = { params: Promise<{ programId: string }> };

export default async function ProgramDetailPage({ params }: PageProps) {
  const { userId: dataUserId, canAssign } = await getTrainingPageAccess();
  const { programId } = await params;
  const [program, staff] = await Promise.all([
    getProgram(dataUserId, programId),
    prisma.staffMember.findMany({
      where: { userId: dataUserId, active: true },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);
  if (!program) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{program.title}</h1>
        <p className="text-sm text-muted-foreground">
          {ROLE_LABEL[program.roleType]} · {DIFFICULTY_LABEL[program.difficulty]} ·{" "}
          {LANGUAGE_LABEL[program.language]} · {program.estimatedMinutes} min
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {program.isOnboardingPath ? <Badge variant="outline">Onboarding path</Badge> : null}
          {program.practiceModeOnly ? <Badge className="bg-amber-100 text-amber-700">Practice mode only</Badge> : null}
          {!program.active ? <Badge variant="outline">Inactive</Badge> : null}
        </div>
      </div>

      {program.description ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{program.description}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Curriculum</CardTitle>
          <CardDescription>{program.modules.length} module{program.modules.length === 1 ? "" : "s"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {program.modules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No modules yet. Seed from a role template to populate.</p>
          ) : (
            program.modules.map((m, idx) => (
              <div key={m.id} className="rounded-lg border">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-3 py-2 text-sm">
                  <p className="font-medium">{idx + 1}. {m.title}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="outline">{m.moduleType.replaceAll("_", " ")}</Badge>
                    {m.quizEnabled ? <Badge className="bg-sky-100 text-sky-700">Quiz</Badge> : null}
                    {m.simulationEnabled ? <Badge className="bg-emerald-100 text-emerald-700">Simulation</Badge> : null}
                    {m.required ? <Badge className="bg-rose-100 text-rose-700">Required</Badge> : null}
                  </div>
                </div>
                <ul className="divide-y text-sm">
                  {m.lessons.map((l, j) => (
                    <li key={l.id} className="px-3 py-2">
                      <p className="font-medium">{j + 1}. {l.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {l.lessonType.replaceAll("_", " ")} · {l.estimatedMinutes} min
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {canAssign ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assign this program</CardTitle>
            <CardDescription>Assign to a staff member or a free-form trainee.</CardDescription>
          </CardHeader>
          <CardContent>
            <AssignProgramForm programId={program.id} staff={staff} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {program.assignments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No assignments yet.</p>
          ) : (
            <ul className="space-y-2">
              {program.assignments.map((a) => (
                <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2 text-sm">
                  <div>
                    <p className="font-medium">
                      {a.assignedTo?.fullName ?? a.assignedTo?.email ??
                        a.assignedToStaff?.name ?? a.assignedToName ?? a.assignedToEmail ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Assigned {a.assignedAt.toISOString().slice(0, 10)}
                      {a.dueAt ? ` · Due ${a.dueAt.toISOString().slice(0, 10)}` : ""}
                      {a.practiceMode ? " · Practice" : ""}
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
    </div>
  );
}
