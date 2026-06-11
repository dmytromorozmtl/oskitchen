import { AssignmentStatusBadge } from "@/components/dashboard/training/status-badges";
import { LessonProgressControls } from "@/components/dashboard/training/lesson-progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { prisma } from "@/lib/prisma";
import { isAssignmentOverdue } from "@/lib/training/training-engine";
import { listAssignments } from "@/services/training/training-service";

export default async function AssignmentsPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const assignments = await listAssignments(dataUserId);

  const lessonsByAssignment = await Promise.all(
    assignments.map(async (a) => {
      const lessons = await prisma.trainingLesson.findMany({
        where: { module: { programId: a.programId } },
        orderBy: [{ module: { orderIndex: "asc" } }, { orderIndex: "asc" }],
        select: {
          id: true, title: true, lessonType: true, estimatedMinutes: true,
        },
      });
      const progressRows = await prisma.trainingProgress.findMany({
        where: { userId: dataUserId, assignmentId: a.id },
        select: { lessonId: true, progressPercent: true, status: true },
      });
      const progressByLesson = new Map(progressRows.map((p) => [p.lessonId, p]));
      return { assignmentId: a.id, lessons, progressByLesson };
    }),
  );

  const lessonsMap = new Map(lessonsByAssignment.map((row) => [row.assignmentId, row]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Assignments</h1>
        <p className="text-sm text-muted-foreground">
          {assignments.length} active assignment{assignments.length === 1 ? "" : "s"}. Mark progress per lesson to drive
          assignment status and certifications.
        </p>
      </div>

      {assignments.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-base">No assignments yet</CardTitle>
            <CardDescription>Assign a program from the programs page.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {assignments.map((a) => {
            const row = lessonsMap.get(a.id);
            const overdue = isAssignmentOverdue({ status: a.status, dueAt: a.dueAt });
            return (
              <Card key={a.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">{a.program.title}</CardTitle>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">{a.completionPercent}%</span>
                      <AssignmentStatusBadge status={a.status} />
                      {overdue ? <span className="text-rose-600">Overdue</span> : null}
                    </div>
                  </div>
                  <CardDescription>
                    Trainee:{" "}
                    {a.assignedTo?.fullName ?? a.assignedTo?.email ??
                      a.assignedToStaff?.name ?? a.assignedToName ?? a.assignedToEmail ?? "—"}
                    {a.dueAt ? ` · Due ${a.dueAt.toISOString().slice(0, 10)}` : ""}
                    {a.practiceMode ? " · Practice mode" : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {row && row.lessons.length > 0 ? (
                    <ul className="space-y-2">
                      {row.lessons.map((l) => {
                        const p = row.progressByLesson.get(l.id);
                        return (
                          <li key={l.id} className="rounded-md border p-3 text-sm">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="font-medium">{l.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {l.lessonType.replaceAll("_", " ")} · {l.estimatedMinutes} min · {p?.progressPercent ?? 0}%
                                </p>
                              </div>
                              <LessonProgressControls
                                assignmentId={a.id}
                                lessonId={l.id}
                                currentPercent={p?.progressPercent ?? 0}
                              />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No lessons configured for this program.</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
